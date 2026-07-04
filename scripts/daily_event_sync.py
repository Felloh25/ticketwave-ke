from google import genai
from google.genai import types
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
import os
import sys
import json
import time
from datetime import datetime, timedelta
import re
import hashlib
import requests
from urllib.parse import urlparse

# Fix Windows cp1252 terminal encoding issues with special characters
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Ordered by preference — falls back if quota exceeded or unavailable.
# NOTE: gemini-2.0-flash-001 / gemini-2.0-flash-lite-001 were deprecated by
# Google on June 1, 2026 — don't add them back even if you see them in older
# examples online, they'll just fail.
MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"]

# Free tier RPM is low (roughly 5-15 requests/minute depending on model).
# Waiting this long BEFORE each call, rather than only reacting after a 429,
# keeps us under that ceiling instead of constantly tripping it.
FREE_TIER_PACING_SECONDS = 7


# ---------------------------------------------------------------------------
# Gemini helpers
# ---------------------------------------------------------------------------

def generate(prompt: str) -> str:
    time.sleep(FREE_TIER_PACING_SECONDS)
    for model_id in MODELS:
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.1),
            )
            return response.text
        except Exception as e:
            msg = str(e)
            if "429" in msg or "quota" in msg.lower():
                match = re.search(r"retry_delay\s*\{\s*seconds:\s*(\d+)", msg)
                wait = int(match.group(1)) + 2 if match else 20
                print(f"  Quota hit on {model_id}, waiting {wait}s...")
                time.sleep(wait)
                continue
            if "404" in msg or "not found" in msg.lower() or "not available" in msg.lower():
                print(f"  Model {model_id} unavailable, trying next...")
                continue
            raise
    raise RuntimeError("All Gemini models quota exceeded.")


# Search-grounded models (grounding only available on flash variants)
SEARCH_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"]

def generate_with_search(prompt: str) -> tuple[str, list[str]]:
    """Generate with Google Search grounding. Returns (text, source_urls).
    Falls back to plain generate() if quota/billing not available."""
    time.sleep(FREE_TIER_PACING_SECONDS)
    for model_id in SEARCH_MODELS:
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    tools=[types.Tool(google_search=types.GoogleSearch())],
                ),
            )
            # Extract grounding source URLs if present
            urls: list[str] = []
            try:
                chunks = response.candidates[0].grounding_metadata.grounding_chunks
                urls = [c.web.uri for c in chunks if c.web and c.web.uri]
            except Exception:
                pass
            return response.text, urls
        except Exception as e:
            msg = str(e)
            if "429" in msg or "quota" in msg.lower():
                match = re.search(r"retry_delay\s*\{\s*seconds:\s*(\d+)", msg)
                wait = int(match.group(1)) + 2 if match else 15
                print(f"  Search quota hit on {model_id}, waiting {wait}s...")
                time.sleep(wait)
                continue
            if "billing" in msg.lower() or "not enabled" in msg.lower():
                print(f"  Search grounding requires billing — skipping")
                raise RuntimeError("billing_required")
            if "404" in msg or "not found" in msg.lower() or "not available" in msg.lower():
                continue
            raise
    raise RuntimeError("All search models quota exceeded.")


# ---------------------------------------------------------------------------
# Sources
# ---------------------------------------------------------------------------

HASHTAGS: dict[str, list[str]] = {
    "nairobi": [
        "nairobievents", "nairobiparty", "nairobiweekend",
        "kenyaconcerts", "blanketsandwine", "solfestafrica", "nairobimusic",
    ],
    "mombasa": [
        "mombasaevents", "mombasanightlife", "mombasaweekend", "coastevents",
    ],
    "kisumu": ["kisumuevents", "kisumulife"],
    "nakuru": ["nakuruevents"],
    "lagos": [
        "lagosevents", "lagosparty", "lagosnightlife", "lagosweekend",
        "lagosmusic", "lagosconcerts", "dettyrave",
    ],
    "accra": ["accraevents", "accranightlife", "accraweekend"],
    "cape-town": ["capetownevents", "capetownnightlife", "capetownmusic"],
    "johannesburg": ["joburglife", "joburgevents", "joburgnightlife"],
    "london": ["londonevents", "londonnightlife", "londonmusic"],
    "new-york": ["nycevents", "nycnightlife", "nycmusic"],
    "dubai": ["dubaievents", "dubainightlife", "dubaiparty"],
}


def _hashtag_sources(city_slug: str) -> list[tuple[str, str]]:
    """Build Instagram hashtag URLs for a city.

    TikTok hashtag pages used to be included too, but in practice every
    single one burned a full Gemini call and still returned 0 events —
    unlike Instagram pages, which short-circuit cheaply (no AI call) when
    there's too little content to bother analyzing. Dropping TikTok cuts
    a large chunk of wasted quota usage with no real loss.
    """
    tags = HASHTAGS.get(city_slug, [])
    sources: list[tuple[str, str]] = []
    for tag in tags:
        sources.append(
            (f"https://www.instagram.com/explore/tags/{tag}/", f"IG #{tag}")
        )
    return sources


def get_sources(city: str, country: str) -> list[tuple[str, str]]:
    city_slug = city.lower().replace(" ", "-")
    country_slug = country.lower().replace(" ", "-")

    sources = [
        (f"https://www.eventbrite.com/d/{country_slug}--{city_slug}/music/", "Eventbrite Music"),
        (f"https://www.eventbrite.com/d/{country_slug}--{city_slug}/nightlife/", "Eventbrite Nightlife"),
        (f"https://www.eventbrite.com/d/{country_slug}--{city_slug}/food-and-drink/", "Eventbrite Food & Drink"),
        (f"https://www.eventbrite.com/d/{country_slug}--{city_slug}/arts/", "Eventbrite Arts"),
        (f"https://allevents.in/{city_slug}/music", "AllEvents Music"),
        (f"https://allevents.in/{city_slug}/nightlife", "AllEvents Nightlife"),
        (f"https://allevents.in/{city_slug}/sports", "AllEvents Sports"),
        (f"https://www.meetup.com/find/?location={city_slug}&source=EVENTS", "Meetup"),
        ("https://devpost.com/hackathons?challenge_type=online,in-person", "Devpost Hackathons"),
    ]

    city_specific: dict[str, list[tuple[str, str]]] = {
        "nairobi": [
            ("https://www.happening.co.ke/", "Happening Kenya"),
            ("https://www.strathmore.edu/events/", "Strathmore University"),
            ("https://www.uonbi.ac.ke/events", "University of Nairobi"),
            ("https://www.kcau.ac.ke/events/", "KCA University"),
            ("https://allevents.in/nairobi/nightlife#rs", "AllEvents Nairobi Featured"),
        ],
        "mombasa": [
            ("https://www.happening.co.ke/mombasa", "Happening Mombasa"),
        ],
        "kisumu": [
            ("https://www.happening.co.ke/kisumu", "Happening Kisumu"),
        ],
        "nakuru": [
            ("https://www.happening.co.ke/nakuru", "Happening Nakuru"),
        ],
        "lagos": [
            ("https://www.eventbrite.com/d/nigeria--lagos/all-events/", "Eventbrite Lagos"),
        ],
        "london": [
            ("https://www.eventbrite.com/d/united-kingdom--london/nightlife/", "Eventbrite London Nightlife"),
            ("https://www.eventbrite.com/d/united-kingdom--london/music/", "Eventbrite London Music"),
        ],
        "new-york": [
            ("https://www.eventbrite.com/d/ny--new-york-city/nightlife/", "Eventbrite NYC Nightlife"),
            ("https://www.eventbrite.com/d/ny--new-york-city/music/", "Eventbrite NYC Music"),
        ],
        "accra": [
            ("https://www.eventbrite.com/d/ghana--accra/all-events/", "Eventbrite Accra"),
        ],
        "cape-town": [
            ("https://www.eventbrite.com/d/south-africa--cape-town/all-events/", "Eventbrite Cape Town"),
        ],
        "johannesburg": [
            ("https://www.eventbrite.com/d/south-africa--johannesburg/all-events/", "Eventbrite Johannesburg"),
        ],
        "dubai": [
            ("https://www.eventbrite.com/d/united-arab-emirates--dubai/all-events/", "Eventbrite Dubai"),
        ],
    }

    sources += city_specific.get(city_slug, [])
    sources += _hashtag_sources(city_slug)

    return sources


# ---------------------------------------------------------------------------
# Scraper
# ---------------------------------------------------------------------------

class EventScraper:
    def __init__(self, city: str = "Nairobi", country: str = "Kenya"):
        self.city = city
        self.country = country
        self.today = datetime.now().date()
        self.current_date = self.today.strftime("%Y-%m-%d")
        self.end_date = (self.today + timedelta(days=90)).strftime("%Y-%m-%d")

    # Domains we trust enough to visit for detail enrichment
    ENRICH_DOMAINS = [
        "eventbrite.com", "allevents.in", "meetup.com", "lu.ma",
        "happening.co.ke", "devpost.com", "strathmore.edu", "uonbi.ac.ke",
        "kcau.ac.ke", "ticketsasa.com", "mookh.com",
    ]

    def scrape_all(self, enrich: bool = True) -> list[dict]:
        sources = get_sources(self.city, self.country)
        all_events: list[dict] = []

        # Phase 0 — Gemini Google Search grounding (runs before Playwright, no browser needed)
        print(f"\n  [Search] Gemini Google Search for {self.city} events...")
        try:
            search_events = self._search_events_via_gemini()
            all_events.extend(search_events)
            print(f"  -> {len(search_events)} events from Google Search")
        except RuntimeError as e:
            if "billing_required" in str(e):
                print(f"  -> Google Search grounding unavailable (billing not enabled)")
            else:
                print(f"  -> Google Search failed: {e}")
        except Exception as e:
            print(f"  -> Google Search failed: {e}")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # Phase 1 — scrape listing pages
            for url, name in sources:
                print(f"\n  Scraping {name}...")
                try:
                    events = self._scrape_source(browser, url, name)
                    all_events.extend(events)
                    print(f"  -> {len(events)} events" if events else "  -> 0 events")
                except Exception as e:
                    print(f"  -> Failed: {e}")
                time.sleep(2)

            # Deduplicate before enrichment
            all_events = self._deduplicate(all_events)

            # Phase 2 — only for primary cities (saves API cost on global runs)
            if enrich:
                enrichable = [e for e in all_events if self._is_enrichable(e.get("ticket_url", ""))]
                if enrichable:
                    print(f"\n  Enriching {len(enrichable)}/{len(all_events)} events with detail pages...")
                    for i, event in enumerate(all_events):
                        if self._is_enrichable(event.get("ticket_url", "")):
                            print(f"    [{i+1}] {event.get('name', '')[:55]}")
                            all_events[i] = self._enrich_event(browser, event)
                            time.sleep(1)
            else:
                print(f"\n  Skipping enrichment for {self.city} (non-primary city)")

            browser.close()

        return self._deduplicate(all_events)

    def _is_enrichable(self, url: str | None) -> bool:
        if not url:
            return False
        return any(d in url for d in self.ENRICH_DOMAINS)

    SOCIAL_DOMAINS = ["instagram.com", "tiktok.com", "twitter.com", "x.com"]

    def _is_social(self, url: str) -> bool:
        return any(d in url for d in self.SOCIAL_DOMAINS)

    def _search_events_via_gemini(self) -> list[dict]:
        """Use Gemini Google Search grounding to discover events. Requires billing."""
        queries = [
            f"upcoming events in {self.city} {self.country} {self.current_date} concerts parties festivals",
            f"things to do in {self.city} this weekend nightlife music food",
            f"{self.city} events April May 2026 tickets",
        ]

        all_events: list[dict] = []
        seen_names: set = set()

        for query in queries:
            prompt = f"""
Search Google for real upcoming events in {self.city}, {self.country}.
Today is {self.current_date}. Only include events between {self.current_date} and {self.end_date}.

Search query to use: "{query}"

For each event found, return a JSON object with:
- name: event title
- date: YYYY-MM-DD
- time: start time or null
- location: venue name and area in {self.city}
- cost: price in local currency of {self.country} e.g. "KES 1500", or "Free", or "TBD"
- description: one compelling sentence about the event
- category: Music | Gaming | Food | Art | Social | Tech | University | Sports | Nightlife | Comedy | Other
- vibe: Casual | Party | Educational | Networking | Creative | Active
- age_group: "18+" | "21+" | "All ages" | "Students"
- ticket_url: direct URL to buy tickets or RSVP, or null
- image_url: null
- status: "confirmed" | "tentative"
- organizer: organizer name or null

Only include events with at minimum a name and approximate date. Do NOT fabricate — only include what you find via search.
Return a JSON array only. No markdown. Return [] if none found.
"""
            try:
                raw, source_urls = generate_with_search(prompt)
                raw = raw.strip()
                raw = re.sub(r"^```(?:json)?", "", raw).rstrip("```").strip()
                if not raw or raw == "[]":
                    continue
                events = json.loads(raw)
                for event in events:
                    if not self._is_valid_date(event.get("date")):
                        continue
                    name_key = re.sub(r"\s+", " ", event.get("name", "")).strip().lower()
                    if name_key in seen_names:
                        continue
                    seen_names.add(name_key)
                    event["source"] = "Gemini Google Search"
                    event["city"] = self.city
                    event["country"] = self.country
                    event["scraped_at"] = datetime.now().isoformat()
                    event["vibe_score"] = self._vibe_score(event)
                    all_events.append(event)
                time.sleep(3)  # be gentle between search queries
            except RuntimeError:
                raise  # propagate billing_required up
            except json.JSONDecodeError:
                print(f"  Search JSON parse error for query: {query[:50]}")
            except Exception as e:
                print(f"  Search query failed: {e}")

        return all_events

    def _scrape_source(self, browser, url: str, site_name: str) -> list[dict]:
        page = browser.new_page()
        try:
            if self._is_social(url):
                return self._scrape_social(page, url, site_name)

            page.goto(url, timeout=60000)
            page.wait_for_timeout(3000)
            text_content = page.evaluate("() => document.body.innerText")
            links = page.evaluate("""() =>
                Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(h => h.startsWith('http'))
                    .slice(0, 300)
            """)
            images = page.evaluate("""() =>
                Array.from(document.querySelectorAll('img[src]'))
                    .map(img => img.src || img.getAttribute('data-src') || '')
                    .filter(s => s.startsWith('http') && s.length > 30 &&
                                 !s.includes('logo') && !s.includes('icon') &&
                                 !s.includes('avatar') && !s.includes('pixel') &&
                                 !s.includes('tracking'))
                    .slice(0, 100)
            """)
            return self._extract_events(text_content, site_name, links=links, images=images)
        except Exception as e:
            print(f"  Error loading {site_name}: {e}")
            return []
        finally:
            page.close()

    def _scrape_social(self, page, url: str, site_name: str) -> list[dict]:
        """Render a social media hashtag page, scroll to load posts, extract events via Gemini."""
        try:
            page.goto(url, timeout=60000)
            page.wait_for_timeout(4000)

            # Dismiss cookie / login modals that block scrolling
            for sel in [
                'button:has-text("Accept")', 'button:has-text("Allow")',
                'button:has-text("Not now")', 'button:has-text("Close")',
                '[aria-label="Close"]', '[aria-label="Dismiss"]',
            ]:
                try:
                    btn = page.query_selector(sel)
                    if btn and btn.is_visible():
                        btn.click()
                        page.wait_for_timeout(800)
                except Exception:
                    pass

            # Scroll down a few times to trigger lazy-loaded posts
            for _ in range(4):
                page.evaluate("window.scrollBy(0, window.innerHeight)")
                page.wait_for_timeout(1500)

            text_content = page.evaluate("() => document.body.innerText")
            links = page.evaluate("""() =>
                Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(h => h.startsWith('http'))
                    .slice(0, 300)
            """)
            images = page.evaluate("""() =>
                Array.from(document.querySelectorAll('img[src]'))
                    .map(img => img.src || img.getAttribute('data-src') || '')
                    .filter(s => s.startsWith('http') && s.length > 30 &&
                                 !s.includes('logo') && !s.includes('icon') &&
                                 !s.includes('avatar') && !s.includes('pixel') &&
                                 !s.includes('tracking'))
                    .slice(0, 100)
            """)

            if not text_content or len(text_content.strip()) < 100:
                print(f"  -> Social page returned too little text, skipping")
                return []

            return self._extract_social_events(text_content, site_name, links=links, images=images)

        except Exception as e:
            print(f"  Error loading social {site_name}: {e}")
            return []

    def _enrich_event(self, browser, event: dict) -> dict:
        """Visit the event's own page and replace listing-page data with accurate details."""
        url = event.get("ticket_url")
        page = browser.new_page()
        try:
            page.goto(url, timeout=30000)
            page.wait_for_timeout(2000)

            text_content = page.evaluate("() => document.body.innerText")

            # Get the event's specific og:image (unique poster)
            image_url: str | None = page.evaluate("""() => {
                const og = document.querySelector('meta[property="og:image"]');
                if (og && og.content && og.content.startsWith('http')) return og.content;
                const imgs = Array.from(document.querySelectorAll('img[src]'));
                const big = imgs.find(img =>
                    img.src.startsWith('http') &&
                    !img.src.includes('logo') && !img.src.includes('icon') &&
                    !img.src.includes('avatar') && !img.src.includes('profile') &&
                    (img.naturalWidth > 400 || img.width > 400)
                );
                return big ? big.src : null;
            }""")

            prompt = f"""
You are extracting complete, accurate event details for EventHive.
Today is {self.current_date}.

Extract ALL of the following from this event page. Be precise — users will rely on this to attend the event.

Return a single JSON object with:
- name: exact official event title
- date: YYYY-MM-DD (required)
- time: exact start time in 12-hour format e.g. "7:30 PM", or "Doors 6:30 PM | Show 8:00 PM" if both listed, or null
- end_time: end time if listed e.g. "11:00 PM", or null
- location: full venue name + street/area e.g. "Carnivore Restaurant, Langata Road, Nairobi"
- cost: ALL ticket tiers in local currency of {self.country}, e.g. "Early Bird: KES 1,500 | Regular: KES 2,500 | VIP: KES 5,000" or "Free" or "TBD"
- description: 2-3 compelling sentences — what happens, who performs/speaks, why attend
- highlights: list of 2-4 bullet strings — performers, speakers, activities, special features
- organizer: name of the organizer or promoter
- category: Music | Gaming | Food | Art | Social | Tech | University | Sports | Nightlife | Comedy | Other
- vibe: Casual | Party | Educational | Networking | Creative | Active
- age_group: "18+" | "21+" | "All ages" | "Students"
- ticket_url: the direct URL to buy tickets or RSVP (use "{url}" if this page is the ticket page)
- status: "confirmed" if date+venue+tickets are set, "tentative" if details may change, "to_be_confirmed" if still being announced

If a field is genuinely unknown, use null. Do NOT guess or fabricate details.
Return a single JSON object only. No markdown.

Event page content:
{text_content[:7000]}
"""
            raw = generate(prompt).strip()
            raw = re.sub(r"^```(?:json)?", "", raw).rstrip("```").strip()
            details = json.loads(raw)

            # Merge enriched data back — only overwrite if we got real values
            for key in ["name", "date", "time", "end_time", "location", "cost",
                        "description", "highlights", "organizer", "category",
                        "vibe", "age_group", "ticket_url", "status"]:
                val = details.get(key)
                if val is not None and val != "" and val != "TBD":
                    event[key] = val

            # Always prefer the detail-page image (unique poster vs shared listing thumbnail)
            if image_url:
                event["image_url"] = image_url

            # Recalculate vibe score with enriched data
            event["vibe_score"] = self._vibe_score(event)
            return event

        except Exception as e:
            print(f"    Enrich failed: {str(e)[:60]}")
            return event
        finally:
            page.close()

    def _extract_social_events(self, text_content: str, source: str, links: list = None, images: list = None) -> list[dict]:
        """Use a social-media-aware prompt to pull events from hashtag page content."""
        links_block = ""
        if links:
            links_block = "\nPOST LINKS (match events to their direct URL):\n" + "\n".join(links[:200])

        images_block = ""
        if images:
            images_block = "\nPOST IMAGES (match events to their poster/flyer image):\n" + "\n".join(images[:80])

        prompt = f"""
You are an event discovery agent for EventHive targeting 18–35 year-olds in {self.city}, {self.country}.
Today is {self.current_date}. Only extract events between {self.current_date} and {self.end_date}.

You are reading content scraped from a SOCIAL MEDIA hashtag page ({source}).
The content is a mix of captions, usernames, likes, comments, and post text.
Your job is to find REAL UPCOMING EVENTS being promoted in these posts.

Look for posts that mention:
- A specific event name (concert, party, festival, show, meetup, etc.)
- A date or day (e.g. "this Saturday", "April 12", "next weekend")
- A venue or location
- Ticket info, RSVP links, or "link in bio"

IGNORE: personal photos, memes, old recaps, ads for products, lifestyle posts with no event.

For each real event found, return a JSON object with:
- name: event title (from the post caption or flyer)
- date: YYYY-MM-DD (convert relative dates like "this Saturday" using today = {self.current_date})
- time: start time or null
- location: venue name and area in {self.city}
- cost: price in local currency of {self.country}, or "Free", or "TBD"
- description: one compelling sentence about the event
- category: Music | Gaming | Food | Art | Social | Tech | University | Sports | Nightlife | Comedy | Other
- vibe: Casual | Party | Educational | Networking | Creative | Active
- age_group: "18+" | "21+" | "All ages" | "Students"
- ticket_url: direct link to event/tickets from POST LINKS (not a profile URL). null if not found.
- image_url: event poster/flyer from POST IMAGES. null if none match.
- status: "confirmed" if date+venue are clear, "tentative" otherwise
- organizer: account name or promoter if visible

IMPORTANT:
- Only extract events with enough detail to be useful (at minimum: name + approximate date)
- Do NOT fabricate events — if a post is vague or not about an event, skip it
- Each image_url must be unique across events

Return a JSON array only. No markdown. Return [] if no events found.

Social media content from {source}:
{text_content[:6000]}
{links_block}
{images_block}
"""
        try:
            raw = generate(prompt).strip()
            raw = re.sub(r"^```(?:json)?", "", raw).rstrip("```").strip()

            if not raw or raw == "[]":
                return []

            events = json.loads(raw)
            result = []
            seen_images: set = set()
            for event in events:
                if not self._is_valid_date(event.get("date")):
                    continue
                event["source"] = source
                event["city"] = self.city
                event["country"] = self.country
                event["scraped_at"] = datetime.now().isoformat()
                event["vibe_score"] = self._vibe_score(event)
                img = event.get("image_url")
                if img:
                    if img in seen_images:
                        event["image_url"] = None
                    else:
                        seen_images.add(img)
                result.append(event)
            return result

        except json.JSONDecodeError:
            match = re.search(r"\[.*\]", raw, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
            print(f"  JSON parse error from {source}")
            return []
        except Exception as e:
            print(f"  AI error from {source}: {e}")
            return []

    def _extract_events(self, text_content: str, source: str, links: list = None, images: list = None) -> list[dict]:
        links_block = ""
        if links:
            links_block = "\nPAGE LINKS (match each event to its specific URL for ticket_url):\n" + "\n".join(links[:200])

        images_block = ""
        if images:
            images_block = "\nPAGE IMAGES (match each event to its poster/thumbnail for image_url):\n" + "\n".join(images[:80])

        prompt = f"""
You are an event curator for EventHive targeting 18–35 year-olds in {self.city}, {self.country}.
Today is {self.current_date}. Only extract events between {self.current_date} and {self.end_date}.

Include: concerts, festivals, DJ nights, comedy, food events, art shows, hackathons, gaming, tech meetups, campus events, sports, cultural festivals, social mixers.
Skip: government meetings, insurance seminars, corporate conferences, medical expos.

For each event extract a JSON object with:
- name: event title
- date: YYYY-MM-DD or null
- time: start time or null
- location: venue name and area
- cost: price in local currency of {self.country} e.g. "KES 500", or "Free", or "TBD"
- description: one sentence on why it is worth attending
- category: Music | Gaming | Food | Art | Social | Tech | University | Sports | Nightlife | Comedy | Other
- vibe: Casual | Party | Educational | Networking | Creative | Active
- age_group: "18+" | "21+" | "All ages" | "Students"
- ticket_url: the SPECIFIC event page URL from PAGE LINKS — must start with https, must not be a listing homepage. null if not found.
- image_url: the event's poster/thumbnail from PAGE IMAGES — pick the best matching image per event. Each image must only be used once. null if none match.
- status: "confirmed" | "tentative" | "to_be_confirmed"

IMPORTANT:
- ticket_url must link to a SPECIFIC event, not the site homepage
- Each image_url must be unique — do not reuse the same image URL across multiple events
- If the same event appears multiple times, extract it only once

Return a JSON array only. No markdown.

Content from {source}:
{text_content[:5000]}
{links_block}
{images_block}
"""
        try:
            raw = generate(prompt).strip()
            raw = re.sub(r"^```(?:json)?", "", raw).rstrip("```").strip()

            if not raw or raw == "[]":
                return []

            events = json.loads(raw)
            result = []
            seen_images: set = set()
            for event in events:
                if not self._is_valid_date(event.get("date")):
                    continue
                event["source"] = source
                event["city"] = self.city
                event["country"] = self.country
                event["scraped_at"] = datetime.now().isoformat()
                event["vibe_score"] = self._vibe_score(event)
                # Deduplicate images — if same image appears on multiple events, clear it
                img = event.get("image_url")
                if img:
                    if img in seen_images:
                        event["image_url"] = None
                    else:
                        seen_images.add(img)
                result.append(event)
            return result

        except json.JSONDecodeError:
            match = re.search(r"\[.*\]", raw, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
            print(f"  JSON parse error from {source}")
            return []
        except Exception as e:
            print(f"  AI error from {source}: {e}")
            return []

    def _is_valid_date(self, date_str: str | None) -> bool:
        if not date_str:
            return False
        try:
            d = datetime.strptime(date_str, "%Y-%m-%d").date()
            return self.today <= d <= self.today + timedelta(days=90)
        except ValueError:
            return False

    def _vibe_score(self, event: dict) -> int:
        score = 5
        category = event.get("category", "").lower()
        cost = str(event.get("cost", "")).lower()
        name = event.get("name", "").lower()
        status = event.get("status", "")

        category_boosts = {
            "music": 3, "gaming": 3, "nightlife": 3, "comedy": 3,
            "university": 2, "social": 2, "food": 2, "art": 2,
            "tech": 1, "sports": 1,
        }
        score += category_boosts.get(category, 0)

        if "free" in cost or cost == "0":
            score += 2
        if status == "confirmed":
            score += 1

        cool_words = ["party", "festival", "concert", "dj", "gaming", "comedy", "pop-up", "hackathon"]
        score += sum(1 for w in cool_words if w in name)

        return min(score, 10)

    def _deduplicate(self, events: list[dict]) -> list[dict]:
        seen_names: set[tuple] = set()
        seen_urls: set[str] = set()
        unique = []
        for event in events:
            name_key = (
                re.sub(r"\s+", " ", event.get("name", "")).strip().lower(),
                event.get("date", ""),
                event.get("city", "").lower(),
            )
            url = event.get("ticket_url") or ""
            if name_key in seen_names:
                continue
            if url and url in seen_urls:
                continue
            seen_names.add(name_key)
            if url:
                seen_urls.add(url)
            unique.append(event)
        return unique


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

# Default cities to scrape — override with EVENT_CITIES env var
# Format: comma-separated "City:Country" pairs
# e.g. EVENT_CITIES="Nairobi:Kenya,Lagos:Nigeria,London:United Kingdom"
DEFAULT_CITIES = [
    # Kenya — multiple cities
    ("Nairobi",       "Kenya"),
    ("Mombasa",       "Kenya"),
    ("Kisumu",        "Kenya"),
    ("Nakuru",        "Kenya"),
    # Africa
    ("Lagos",         "Nigeria"),
    ("Accra",         "Ghana"),
    ("Cape Town",     "South Africa"),
    ("Johannesburg",  "South Africa"),
    # Global
    ("London",        "United Kingdom"),
    ("New York",      "United States"),
    ("Dubai",         "United Arab Emirates"),
]


def parse_cities() -> list[tuple[str, str]]:
    raw = os.getenv("EVENT_CITIES", "").strip()
    if not raw:
        return DEFAULT_CITIES
    cities = []
    for entry in raw.split(","):
        parts = entry.strip().split(":", 1)
        if len(parts) == 2:
            cities.append((parts[0].strip(), parts[1].strip()))
    return cities or DEFAULT_CITIES


def deduplicate_global(events: list[dict]) -> list[dict]:
    seen: set[tuple] = set()
    unique = []
    for event in events:
        key = (
            re.sub(r"\s+", " ", event.get("name", "")).strip().lower(),
            event.get("date", ""),
            event.get("city", "").lower(),
        )
        if key not in seen:
            seen.add(key)
            unique.append(event)
    return unique


# ---------------------------------------------------------------------------
# Supabase persistence (replaces the original Neon/persist_events_to_db)
# ---------------------------------------------------------------------------
# This section writes into TicketWave KE's existing `events` table
# (columns: title, description, date, location, price, tag, image_url, status)
# instead of the original EventHive Neon schema.

from supabase import create_client

# Categories from the scraper that don't exist in TicketWave's filter UI
# (Music, Tech, Food, Sports, Art, Comedy, Networking) get mapped to their
# closest match so they still show up under a sensible filter tab.
CATEGORY_MAP = {
    "Music": "Music",
    "Gaming": "Tech",
    "Food": "Food",
    "Art": "Art",
    "Social": "Networking",
    "Tech": "Tech",
    "University": "Networking",
    "Sports": "Sports",
    "Nightlife": "Music",
    "Comedy": "Comedy",
    "Other": "Music",
}

FALLBACK_IMAGE = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80"

IMAGE_CHECK_HEADERS = {
    # Some sites block requests with no browser-like User-Agent.
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}


def resolve_image_url(image_url: str | None) -> str:
    """Confirm a scraped image URL actually loads a real image before using it.

    Scraped URLs sometimes turn out relative, expired, or hotlink-blocked —
    those render as a broken image icon on the site. This does a quick check
    and falls back to a generic placeholder instead of a broken link.

    Many event/ticketing sites block image requests that don't carry a
    Referer matching their own domain (hotlink protection) — without this,
    plenty of perfectly real posters get wrongly rejected as "broken".
    """
    if not image_url or not image_url.startswith("http"):
        return FALLBACK_IMAGE

    parsed = urlparse(image_url)
    referer = f"{parsed.scheme}://{parsed.netloc}/"
    headers = {**IMAGE_CHECK_HEADERS, "Referer": referer}

    for attempt_headers in (headers, IMAGE_CHECK_HEADERS):
        try:
            resp = requests.head(
                image_url, headers=attempt_headers, timeout=6, allow_redirects=True
            )
            # Some CDNs don't support HEAD properly — treat those as
            # inconclusive and fall through to a lightweight GET instead of
            # trusting a 405/403.
            if resp.status_code >= 400:
                resp = requests.get(
                    image_url, headers=attempt_headers, timeout=6, stream=True
                )
            content_type = resp.headers.get("content-type", "")
            if resp.status_code < 400 and content_type.startswith("image/"):
                return image_url
        except Exception:
            continue

    return FALLBACK_IMAGE

# Very rough, static conversion for non-KES prices. Not live exchange rates —
# good enough to avoid showing "USD 140" as literally 140 KES, but treat
# converted prices as approximate and spot-check them in the admin dashboard.
CURRENCY_TO_KES = {
    "usd": 130,
    "$": 130,
    "eur": 140,
    "gbp": 165,
}


def parse_price_to_kes(cost: str | None) -> int:
    """Best-effort parse of a free-text cost string into a whole KES amount."""
    if not cost:
        return 0
    text = cost.strip().lower()
    if "free" in text:
        return 0

    match = re.search(r"[\d,]+(\.\d+)?", text)
    if not match:
        return 0
    amount = float(match.group(0).replace(",", ""))

    rate = 1
    for currency, r in CURRENCY_TO_KES.items():
        if currency in text:
            rate = r
            break

    return int(round(amount * rate))


def format_display_date(date_str: str | None, time_str: str | None) -> str:
    """Combine YYYY-MM-DD + time into 'Sat, Jul 12, 2026 - 4:00 PM' style.

    The year MUST be included: the cleanup-events cron re-parses this string
    with JavaScript's `new Date(...)`, and a date string with no year silently
    defaults to 2001 — which would make every synced event look like it's
    already in the past and get swept into the gallery immediately.
    """
    if not date_str:
        return time_str or ""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return f"{date_str} {time_str or ''}".strip()

    base = d.strftime("%a, %b %d, %Y")
    if time_str:
        return f"{base} - {time_str}"
    return base


def persist_events_to_supabase(events: list[dict]) -> tuple[int, int]:
    """Insert scraped events into TicketWave KE's Supabase `events` table.

    Skips events that already exist (matched by title + date) so re-running
    this daily doesn't create duplicates. Returns (inserted, skipped).
    """
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or os.getenv(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", ""
    ).strip()

    if not supabase_url or not supabase_key:
        print("Supabase persistence skipped: NEXT_PUBLIC_SUPABASE_URL / key not set")
        return 0, 0

    client = create_client(supabase_url, supabase_key)

    inserted = 0
    skipped = 0

    for event in events:
        name = (event.get("name") or "").strip()
        date_val = event.get("date")
        if not name or not date_val:
            skipped += 1
            continue

        # Duplicate check: same title + same raw date already in the table.
        existing = (
            client.table("events")
            .select("id")
            .eq("title", name)
            .eq("date", format_display_date(date_val, event.get("time")))
            .limit(1)
            .execute()
        )
        if existing.data:
            skipped += 1
            continue

        row = {
            "title": name,
            "description": event.get("description") or "",
            "date": format_display_date(date_val, event.get("time")),
            "location": event.get("location") or "TBA",
            "price": parse_price_to_kes(event.get("cost")),
            "tag": CATEGORY_MAP.get(event.get("category") or "", "Music"),
            "image_url": resolve_image_url(event.get("image_url")),
            "ticket_url": event.get("ticket_url") or None,
            "status": "approved",
            "source": "scraped",
        }

        try:
            client.table("events").insert(row).execute()
            inserted += 1
        except Exception as e:
            print(f"  Failed to insert '{name}': {e}")
            skipped += 1

    return inserted, skipped


ROTATION_CITIES = [
    ("Nairobi", "Kenya"),
    ("Mombasa", "Kenya"),
    ("Kisumu", "Kenya"),
    ("Eldoret", "Kenya"),
    ("Machakos", "Kenya"),
]


def main():
    # On the free Gemini tier, scraping several cities in one run reliably
    # hits the quota. Instead, rotate ONE city per day (Mon->Nairobi,
    # Tue->Mombasa, ...) so every city still gets synced regularly without
    # exceeding free-tier limits. Set EVENT_CITIES explicitly to override
    # this and force a specific city (handy for manual test runs).
    if os.getenv("EVENT_CITIES", "").strip():
        cities = parse_cities()
    else:
        weekday = datetime.utcnow().weekday()  # Monday = 0
        cities = [ROTATION_CITIES[weekday % len(ROTATION_CITIES)]]

    all_events: list[dict] = []

    print("TICKETWAVE KE — DAILY EVENT SYNC")
    print(f"Cities: {', '.join(f'{c}, {co}' for c, co in cities)}")
    print("=" * 60)

    PRIMARY_CITIES = {"nairobi", "mombasa"}

    for city, country in cities:
        scraper = EventScraper(city=city, country=country)
        print(f"\n>> Scraping {city}, {country}  ({scraper.current_date} to {scraper.end_date})")
        enrich = city.lower() in PRIMARY_CITIES or len(cities) == 1
        try:
            city_events = scraper.scrape_all(enrich=enrich)
            all_events.extend(city_events)
            print(f"   {len(city_events)} events collected from {city}")
        except Exception as e:
            print(f"   Failed to scrape {city}: {e}")

    events = deduplicate_global(all_events)

    if not events:
        print("\nNo events found. Nothing to sync.")
        return

    print(f"\nTOTAL: {len(events)} unique events found")

    # Diagnostic: confirm whether ticket_url is actually present at this
    # point, before it gets saved to Supabase.
    with_url = sum(1 for e in events if e.get("ticket_url"))
    print(f"Events with a ticket_url found: {with_url}/{len(events)}")
    if events:
        print(f"Sample ticket_url: {events[0].get('ticket_url')!r}")

    inserted, skipped = persist_events_to_supabase(events)
    print(f"\nSynced to Supabase: {inserted} new events added, {skipped} skipped (duplicates/errors)")


if __name__ == "__main__":
    main()