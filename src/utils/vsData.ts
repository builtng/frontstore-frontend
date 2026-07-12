export interface VsFeatureRow {
  feature: string;
  frontstore: string;
  competitor: string;
}

export interface VsFaq {
  question: string;
  answer: string;
}

export interface VsCompetitor {
  slug: string;
  name: string;
  website: string;
  tagline: string;
  category: string;
  hue: number;
  metaTitle: string;
  metaDescription: string;
  heroLine: string;
  summary: string;
  pricingNote: string;
  bestFor: string;
  strengths: string[];
  gaps: string[];
  featureRows: VsFeatureRow[];
  switchReasons: { title: string; body: string }[];
  faqs: VsFaq[];
}

export const VS_COMPETITORS: VsCompetitor[] = [
  {
    slug: 'bumpa',
    name: 'Bumpa',
    website: 'getbumpa.com',
    tagline: 'retail management app for Nigerian merchants',
    category: 'Inventory & POS',
    hue: 265,
    metaTitle: 'Frontstore vs Bumpa: Which Is Better for WhatsApp Sellers? (2026)',
    metaDescription: 'Comparing Frontstore and Bumpa on WhatsApp checkout, AI product listings, pricing, and setup time for African merchants selling on WhatsApp and Instagram.',
    heroLine: 'Both help Nigerian merchants sell online. Frontstore is built around the WhatsApp chat itself; Bumpa is built around a storefront, inventory ledger, and point-of-sale system.',
    summary: 'Bumpa is a business management app used by a large base of Nigerian retailers to run a storefront, track inventory, manage staff, and take payments in person through Bumpa Terminal. It grew out of point-of-sale and stock control rather than chat commerce, so orders placed on the storefront land in a Bumpa dashboard rather than as a pre-filled WhatsApp message.',
    pricingNote: 'Bumpa is billed in tiers starting around ₦15,000 per quarter for the Starter plan and roughly ₦30,000 per quarter for Pro, with Growth, Scale, and Premium tiers priced on request as merchants add staff seats and locations. Frontstore offers a Free plan, Pro at ₦1,500 a month (₦15,000 a year), and Legend at ₦5,000 a month (₦50,000 a year) — WhatsApp checkout and AI listings are included on every paid tier, not gated behind a separate add-on, and none of Frontstore\'s prices rise with staff seats or locations the way Bumpa\'s do.',
    bestFor: 'Merchants who need multi-staff inventory control and in-person POS across physical locations, and can absorb tiered subscription pricing as they scale.',
    strengths: [
      'Long-standing product with a large existing Nigerian merchant base and community',
      'Deep inventory and stock-level tooling, including barcode generation and low-stock alerts',
      'Bumpa Terminal gives merchants a card-accepting POS device for physical stores',
    ],
    gaps: [
      'Checkout is a web-based cart and dashboard flow rather than a native WhatsApp message to the merchant',
      'No built-in AI tool to turn a product photo into a listing — descriptions and pricing are entered by hand',
      'Pricing rises by tier as a business adds staff, locations, or features, instead of a flat per-plan rate that doesn\'t scale with headcount',
    ],
    featureRows: [
      { feature: 'Checkout destination', frontstore: 'Pre-filled order lands directly in the merchant\'s WhatsApp chat', competitor: 'Order placed on storefront, managed inside the Bumpa dashboard' },
      { feature: 'AI product listings', frontstore: 'Upload a photo → AI writes the name, description, tags, and price', competitor: 'Manual entry for product name, description, and pricing' },
      { feature: 'Setup time', frontstore: 'Under 2 minutes to claim a link and publish a storefront', competitor: 'Guided onboarding across storefront, inventory, and payment setup' },
      { feature: 'Pricing model', frontstore: 'Free, Pro ₦1,500/mo, or Legend ₦5,000/mo — never rises with staff or locations', competitor: 'Tiered plans from ~₦15,000/quarter, higher tiers for staff & locations' },
      { feature: 'Point of sale (in-person)', frontstore: 'Not a core focus — built for chat-first, delivery-led selling', competitor: 'Bumpa Terminal card POS for in-store, in-person sales' },
      { feature: 'African payment rails', frontstore: 'Paystack, Flutterwave, and mobile money, with escrow options', competitor: 'Paystack and Flutterwave, plus USD support' },
    ],
    switchReasons: [
      { title: 'Orders that land where the merchant already is', body: 'Instead of checking a separate dashboard for new orders, merchants get a formatted WhatsApp message the moment a customer taps buy — no context switching between apps.' },
      { title: 'Listing 30 products without typing 30 descriptions', body: 'Merchants photograph stock and let AI draft the copy, tags, and suggested price, which matters most for sellers restocking frequently.' },
      { title: 'No price hikes for growing a team', body: 'Frontstore\'s Pro and Legend plans don\'t add a staff-count or location surcharge — a solo merchant and a growing one pay the same rate for WhatsApp checkout and AI listings on the same plan, instead of unlocking features by headcount.' },
    ],
    faqs: [
      { question: 'Is Frontstore cheaper than Bumpa?', answer: 'Frontstore starts free, with Pro at ₦1,500/month (₦15,000/year) covering every core feature and Legend at ₦5,000/month adding unlimited AI. Bumpa\'s published tiers start around ₦15,000/quarter for Starter and ₦30,000/quarter for Pro, with higher tiers priced on request as a business adds staff or locations. Pricing on both platforms can change, so check each provider\'s current pricing page before deciding.' },
      { question: 'Does Bumpa send orders straight to WhatsApp?', answer: 'Bumpa\'s storefront takes orders into its own dashboard rather than generating a pre-filled WhatsApp message to the merchant. Frontstore is built around that WhatsApp handoff as the primary checkout step.' },
      { question: 'Can I move my Bumpa catalog to Frontstore?', answer: 'Yes. Merchants typically re-upload product photos and let Frontstore\'s AI generate names, descriptions, and pricing, which is usually faster than manually retyping an existing catalog.' },
      { question: 'Does Frontstore have a point-of-sale option like Bumpa Terminal?', answer: 'Frontstore is built primarily for chat-first and delivery-led selling rather than in-person card payments. Merchants who need a physical card terminal for a shopfront may find Bumpa\'s POS tooling more mature.' },
    ],
  },
  {
    slug: 'myshoplet',
    name: 'MyShoplet',
    website: 'myshoplet.com',
    tagline: 'AI WhatsApp selling platform',
    category: 'WhatsApp AI Commerce',
    hue: 210,
    metaTitle: 'Frontstore vs MyShoplet: WhatsApp Commerce Compared (2026)',
    metaDescription: 'A feature and pricing comparison of Frontstore and MyShoplet for merchants selling through WhatsApp, covering AI tools, storefronts, and monthly cost.',
    heroLine: 'MyShoplet and Frontstore are the two platforms closest in vision — both put WhatsApp and AI at the center. The difference shows up mainly in pricing and how deep each product goes outside WhatsApp.',
    summary: 'MyShoplet is a newer all-in-one commerce platform for Nigerian businesses, combining a WhatsApp AI sales agent, a branded online storefront, point-of-sale tooling, and delivery rate integrations with Sendbox and Shipbubble. Its AI agent is designed to answer customer questions and process orders in the WhatsApp chat automatically.',
    pricingNote: 'MyShoplet publishes three monthly tiers: Growth at ₦15,000/month (with a 1% transaction fee), Pro at ₦35,000/month (0% transaction fee), and an Enterprise tier at ₦75,000/month for multi-location businesses. Frontstore offers a Free plan, Pro at ₦1,500/month (₦15,000/year), and Legend at ₦5,000/month (₦50,000/year), all carrying the same flat 1.5% transaction fee — the fee itself never changes by tier, unlike MyShoplet where upgrading is the only way to lower it.',
    bestFor: 'Merchants who want an automated WhatsApp AI agent handling replies around the clock and are comfortable with a higher monthly subscription as the tradeoff.',
    strengths: [
      'AI agent that can hold a WhatsApp conversation and process an order without merchant involvement',
      'Built-in delivery rate comparison through Sendbox and Shipbubble integrations',
      'Offline-capable POS for in-person sales alongside the online storefront',
    ],
    gaps: [
      'Entry-level pricing (₦15,000/month) is 10x Frontstore\'s Pro plan (₦1,500/month), even before either platform\'s transaction fees',
      'Newer brand with a smaller published merchant base and ecosystem than more established players',
      'Multi-location support is listed as an upcoming Enterprise feature rather than available today',
    ],
    featureRows: [
      { feature: 'WhatsApp order flow', frontstore: 'Buyer taps order → pre-filled message opens directly in merchant\'s WhatsApp', competitor: 'AI agent replies and processes orders inside the WhatsApp chat' },
      { feature: 'AI product listings', frontstore: 'Upload a photo → AI writes name, description, tags, and price', competitor: 'AI is focused on customer conversation, not catalog creation' },
      { feature: 'Pricing model', frontstore: 'Free, Pro ₦1,500/mo, or Legend ₦5,000/mo — same flat 1.5% fee on every tier', competitor: '₦15,000–₦75,000/month by tier; 1%–0% transaction fee depending on tier' },
      { feature: 'Setup time', frontstore: 'Under 2 minutes to claim a link and go live', competitor: 'Storefront can be set up within minutes, per their onboarding flow' },
      { feature: 'Point of sale (in-person)', frontstore: 'Not a core focus — built for chat-first, delivery-led selling', competitor: 'Offline-capable POS accepting cash, transfer, and card' },
      { feature: 'Multi-currency', frontstore: 'NGN, GHS, KES, UGX, ZAR and more', competitor: 'Primarily focused on the Nigerian market' },
    ],
    switchReasons: [
      { title: 'One flat fee instead of a rate that changes by tier', body: 'MyShoplet\'s entry tier carries a 1% transaction fee, and dropping to 0% means paying ₦35,000/month for the Pro plan. Frontstore charges the same flat 1.5% whether a merchant is on Free, Pro, or Legend, so the fee never depends on upgrading a plan.' },
      { title: 'AI that builds the catalog, not just the chat replies', body: 'Frontstore\'s AI is aimed at the slowest part of onboarding — writing descriptions and pricing for every product — rather than only automating customer replies.' },
      { title: 'Broader currency support for pan-African merchants', body: 'Sellers operating outside Nigeria, or shipping across borders, get native pricing in NGN, GHS, KES, UGX, and ZAR without manual conversion.' },
    ],
    faqs: [
      { question: 'Is MyShoplet more expensive than Frontstore?', answer: 'Yes, based on publicly listed pricing: MyShoplet\'s tiers run ₦15,000–₦75,000/month, while Frontstore starts free and its Pro plan is ₦1,500/month (₦15,000/year). Always confirm current pricing on each provider\'s site, since plans change.' },
      { question: 'Does MyShoplet have an AI product listing tool like Frontstore?', answer: 'MyShoplet\'s AI is built around handling WhatsApp customer conversations automatically. Frontstore\'s AI is built around turning a product photo into a full listing — name, description, tags, and price — which addresses a different part of the workflow.' },
      { question: 'Which platform is better outside Nigeria?', answer: 'MyShoplet\'s published feature set is centered on the Nigerian market. Frontstore supports NGN, GHS, KES, UGX, and ZAR, which matters for merchants in Ghana, Kenya, Uganda, or South Africa, or those shipping across borders.' },
    ],
  },
  {
    slug: 'catlog',
    name: 'Catlog',
    website: 'catlog.shop',
    tagline: 'simple WhatsApp catalogue builder',
    category: 'Online Catalogue',
    hue: 30,
    metaTitle: 'Frontstore vs Catlog: Comparing WhatsApp Store Builders (2026)',
    metaDescription: 'How Frontstore compares to Catlog for merchants who want a simple online catalogue with WhatsApp ordering, AI listings, and African payment support.',
    heroLine: 'Catlog and Frontstore both promise a store you can launch in minutes. Frontstore adds AI listing generation and a WhatsApp-native checkout on top of the same simple starting point.',
    summary: 'Catlog lets merchants create an online store, list products, collect local and international payments, and keep basic business records, positioning itself around simplicity and a five-minute setup. It covers storefront, payments, and delivery coordination in one lightweight tool.',
    pricingNote: 'Catlog runs paid monthly plans (billed monthly, quarterly, biannually, or yearly, with a discount for longer commitments), though published tier pricing has varied across its own marketing pages — check catlog.shop/pricing for current rates. Frontstore offers a Free plan, Pro at ₦1,500/month (₦15,000/year), and Legend at ₦5,000/month (₦50,000/year) — none of which change with catalogue size.',
    bestFor: 'Merchants who want the lightest possible catalogue-and-payment-link setup and don\'t need AI-assisted listings or deep business records.',
    strengths: [
      'Straightforward product catalogue that\'s quick to learn for a first-time online seller',
      'Local and international payment collection built in',
      'Basic order and customer record keeping alongside the storefront',
    ],
    gaps: [
      'No AI tool to generate product descriptions, tags, or pricing from a photo',
      'Business management stays fairly basic — no staff accounts, inventory alerts, or POS layer',
      'No dedicated WhatsApp-native checkout flow; the store operates as a standalone catalogue',
    ],
    featureRows: [
      { feature: 'WhatsApp checkout', frontstore: 'Buyer\'s order becomes a pre-filled WhatsApp message to the merchant', competitor: 'Storefront collects orders and payment; not built around a WhatsApp handoff' },
      { feature: 'AI product listings', frontstore: 'Upload a photo → AI writes name, description, tags, and price', competitor: 'Products are entered manually into the catalogue' },
      { feature: 'Setup time', frontstore: 'Under 2 minutes to claim a link and publish a storefront', competitor: 'Advertised as roughly 5 minutes to set up a store' },
      { feature: 'Pricing model', frontstore: 'Free, Pro ₦1,500/mo, or Legend ₦5,000/mo — none scale with catalogue size', competitor: 'Paid monthly plans; published tier pricing varies by source' },
      { feature: 'Business record keeping', frontstore: 'Order and customer history tied to the storefront', competitor: 'Order, customer, and basic record tracking built in' },
      { feature: 'African payment rails', frontstore: 'Paystack, Flutterwave, and mobile money, with escrow options', competitor: 'Local and international payment collection' },
    ],
    switchReasons: [
      { title: 'AI does the catalogue typing', body: 'Merchants moving fast inventory don\'t have time to write 40 product descriptions by hand — Frontstore\'s AI drafts them from photos in seconds.' },
      { title: 'The order shows up in the merchant\'s own chat', body: 'Frontstore\'s checkout ends in a formatted WhatsApp message to the merchant, keeping order confirmation in the same app most sellers already run their business from.' },
      { title: 'Plan price stays put as the catalogue grows', body: 'Whichever tier a merchant picks, Frontstore doesn\'t charge more as they add products, staff logins, or order volume — upgrading is a choice, not something the catalogue forces.' },
    ],
    faqs: [
      { question: 'Is Catlog free to use?', answer: 'Catlog offers a short free trial before requiring a paid monthly plan. Frontstore\'s Free plan has no time limit, and its Pro tier (₦1,500/month or ₦15,000/year) includes AI listings and unlimited products from day one.' },
      { question: 'Does Catlog have AI product listing generation?', answer: 'Catlog\'s catalogue is built through manual product entry. Frontstore lets a merchant upload a product photo and have AI generate the name, description, tags, and suggested price automatically.' },
      { question: 'Which is better for a merchant just starting out?', answer: 'Both platforms advertise a fast setup. The practical difference shows up once a merchant has more than a handful of products to list — Frontstore\'s AI listing tool removes most of the manual data entry that a growing catalogue requires.' },
    ],
  },
  {
    slug: 'selar',
    name: 'Selar',
    website: 'selar.com',
    tagline: 'platform for selling digital products',
    category: 'Digital Products',
    hue: 340,
    metaTitle: 'Frontstore vs Selar: Which Fits Your Business? (2026)',
    metaDescription: 'Selar is built for digital products and creators. See how Frontstore compares for merchants selling physical products through WhatsApp and social media.',
    heroLine: 'Selar and Frontstore solve different problems. Selar is built for creators selling ebooks, courses, and digital files; Frontstore is built for merchants moving physical inventory through WhatsApp.',
    summary: 'Selar is positioned as "the best way to sell digital products online," giving creators a checkout link for ebooks, courses, templates, and other digital files, with global payment collection and a transaction fee on each sale. Physical product and inventory workflows are not its primary focus.',
    pricingNote: 'Selar offers a free plan (transaction fees apply on sales), a Pro plan around ₦12,000/$30 per month, and a Turbo plan around ₦22,500/$45 per month, plus a per-transaction fee of roughly 4% + ₦50 on Naira sales. Frontstore offers a Free plan, Pro at ₦1,500/month (₦15,000/year), and Legend at ₦5,000/month (₦50,000/year), all carrying the same flat 1.5% per-sale transaction fee — well under half Selar\'s rate on every tier, with no fixed ₦50 add-on.',
    bestFor: 'Creators and course sellers whose product is a digital file or link, where Selar\'s checkout and delivery flow is purpose-built.',
    strengths: [
      'Purpose-built checkout and delivery for digital files, courses, and memberships',
      'Free plan available to start selling with no upfront subscription',
      'Established brand among Nigerian creators and digital entrepreneurs',
    ],
    gaps: [
      'Physical inventory, stock levels, and delivery logistics are not the core use case',
      'A transaction fee applies on every sale in addition to any subscription cost',
      'No WhatsApp-native checkout — Selar\'s flow centers on a hosted payment link, not a chat handoff',
    ],
    featureRows: [
      { feature: 'Primary use case', frontstore: 'Physical products and services sold and delivered locally', competitor: 'Digital products — ebooks, courses, templates, memberships' },
      { feature: 'WhatsApp checkout', frontstore: 'Buyer\'s order becomes a pre-filled WhatsApp message to the merchant', competitor: 'Checkout happens on a hosted payment link, shared anywhere including WhatsApp' },
      { feature: 'AI product listings', frontstore: 'Upload a photo → AI writes name, description, tags, and price', competitor: 'Products are listed manually with file uploads' },
      { feature: 'Transaction fees', frontstore: 'Flat 1.5% per sale, no fixed fee on top', competitor: '~4% + ₦50 per Naira transaction, even on paid plans' },
      { feature: 'Pricing model', frontstore: 'Free, Pro ₦1,500/mo, or Legend ₦5,000/mo — plus the same flat 1.5% per sale on every tier', competitor: 'Free plan, or ₦12,000–₦22,500/month, plus ~4% + ₦50 per sale' },
      { feature: 'Inventory & stock tracking', frontstore: 'Product quantities and variants for physical stock', competitor: 'Not applicable — digital files don\'t carry stock levels' },
    ],
    switchReasons: [
      { title: 'Built for stock, not just files', body: 'Merchants selling physical products need quantity tracking, variants, and delivery coordination that a digital-download checkout doesn\'t need to solve.' },
      { title: 'Less than half the fee, with no fixed add-on', body: 'Selar\'s ~4% + ₦50 transaction fee applies on top of any subscription. Frontstore charges a flat 1.5% with no fixed per-sale add-on on every tier — Free, Pro, or Legend — so more of each sale on physical goods stays with the merchant.' },
      { title: 'Order details land in WhatsApp, not just a receipt page', body: 'For physical goods, a merchant needs the buyer\'s size, quantity, and delivery address in the same place they\'ll coordinate delivery — their WhatsApp chat.' },
    ],
    faqs: [
      { question: 'Can I sell physical products on Selar?', answer: 'Selar is built and marketed around digital products — ebooks, courses, and similar files. Frontstore is built specifically for physical inventory sold and delivered through WhatsApp, with stock and variant tracking Selar doesn\'t need to offer.' },
      { question: 'Does Frontstore charge a transaction fee like Selar?', answer: 'Yes, but a lower one, and it doesn\'t change by plan. Frontstore charges a flat 1.5% per sale on Free, Pro (₦1,500/month or ₦15,000/year), and Legend (₦5,000/month) alike, with no fixed fee added. Selar applies a per-transaction fee of roughly 4% + ₦50 on Naira sales in addition to any subscription plan.' },
      { question: 'Should I use both Selar and Frontstore?', answer: 'Some sellers do — Selar for a digital product line (like a course or ebook) and Frontstore for a physical storefront sold through WhatsApp. The two aren\'t mutually exclusive if a business sells both types of products.' },
    ],
  },
  {
    slug: 'vendda',
    name: 'Vendda',
    website: 'vendda.co',
    tagline: 'business management platform with retail POS',
    category: 'Retail & POS',
    hue: 160,
    metaTitle: 'Frontstore vs Vendda: WhatsApp Storefront vs Business Suite (2026)',
    metaDescription: 'Comparing Frontstore and Vendda for African merchants — WhatsApp-native checkout and AI listings versus a broader retail, invoicing, and CRM suite.',
    heroLine: 'Vendda packages a storefront, mobile POS, invoicing, and CRM into one business suite. Frontstore focuses narrowly on making the WhatsApp order flow itself faster and more automated.',
    summary: 'Vendda describes itself as an all-in-one business management solution for African merchants, combining an online storefront, a mobile point-of-sale that works offline, VAT-compliant invoicing for B2B sellers, and CRM tools for customer campaigns. WhatsApp shows up as order notifications and abandoned-cart recovery messages rather than as the primary checkout channel.',
    pricingNote: 'Vendda does not publish exact pricing on its main marketing pages, directing visitors to a dedicated pricing section with free account creation. Frontstore publishes its full pricing upfront: Free, Pro at ₦1,500/month (₦15,000/year), and Legend at ₦5,000/month (₦50,000/year), all with the same flat 1.5% transaction fee.',
    bestFor: 'Businesses that need invoicing, offline POS, and CRM campaign tools in one suite, particularly B2B or service sellers who bill formally.',
    strengths: [
      'VAT-compliant invoicing built for B2B and service-based businesses',
      'Offline-capable mobile POS that syncs sales once back online',
      'CRM tools for bulk campaigns and customer segmentation',
    ],
    gaps: [
      'WhatsApp is used for order notifications and cart-recovery messages, not as the checkout step itself',
      'No stated AI tool for generating product listings from photos',
      'Broader feature surface (invoicing, CRM, POS) than a merchant who only needs a fast WhatsApp storefront may need',
    ],
    featureRows: [
      { feature: 'WhatsApp role', frontstore: 'Primary checkout channel — the order itself is a WhatsApp message', competitor: 'Order notifications and abandoned-cart recovery messages' },
      { feature: 'AI product listings', frontstore: 'Upload a photo → AI writes name, description, tags, and price', competitor: 'No published AI listing tool' },
      { feature: 'Setup time', frontstore: 'Under 2 minutes to claim a link and publish a storefront', competitor: 'Storefront advertised as ready "in minutes"' },
      { feature: 'Invoicing', frontstore: 'Not a core focus — built for direct-to-consumer WhatsApp sales', competitor: 'VAT-compliant invoicing with automated payment reminders' },
      { feature: 'Point of sale (in-person)', frontstore: 'Not a core focus — built for chat-first, delivery-led selling', competitor: 'Offline mobile POS that syncs when back online' },
      { feature: 'Pricing model', frontstore: 'Free, Pro ₦1,500/mo, or Legend ₦5,000/mo — published upfront', competitor: 'Pricing not published on main site; requires signup to view' },
    ],
    switchReasons: [
      { title: 'The chat is the checkout, not an afterthought', body: 'Rather than sending a notification about an order placed elsewhere, Frontstore generates the order as a WhatsApp message in the first place — one less step for both merchant and buyer.' },
      { title: 'Photo in, listing out', body: 'Frontstore\'s AI writes the product name, description, tags, and price from an uploaded photo, cutting catalogue setup time for merchants who don\'t need invoicing or CRM tooling.' },
      { title: 'Pricing you can see before signing up', body: 'Frontstore publishes every plan\'s price on the website. Merchants comparing costs don\'t need to create an account just to see what a plan costs.' },
    ],
    faqs: [
      { question: 'Does Vendda offer WhatsApp checkout like Frontstore?', answer: 'Vendda uses WhatsApp for order notifications and abandoned-cart recovery messages. Frontstore\'s checkout flow itself is a pre-filled WhatsApp message sent to the merchant, making WhatsApp the primary order channel rather than a notification layer.' },
      { question: 'Is Vendda or Frontstore cheaper?', answer: 'Vendda does not publish pricing on its main marketing pages, so a direct comparison requires creating an account. Frontstore publishes its pricing upfront: free to start, Pro at ₦1,500/month (₦15,000/year), or Legend at ₦5,000/month.' },
      { question: 'Which platform should a service business with invoicing needs choose?', answer: 'Vendda\'s VAT-compliant invoicing and CRM tools are built for B2B and service billing. Frontstore is focused on direct-to-consumer WhatsApp sales and doesn\'t currently offer formal invoicing.' },
    ],
  },
  {
    slug: 'shopify',
    name: 'Shopify',
    website: 'shopify.com',
    tagline: 'global ecommerce website builder',
    category: 'Global Ecommerce',
    hue: 150,
    metaTitle: 'Frontstore vs Shopify: The Best Shopify Alternative for Nigeria? (2026)',
    metaDescription: 'Shopify is priced and built for global ecommerce. See how Frontstore compares for African merchants who sell mainly through WhatsApp, Instagram, and TikTok.',
    heroLine: 'Shopify is the world\'s biggest website builder for online stores. Frontstore is built specifically for merchants whose customers order through WhatsApp, not a shopping cart.',
    summary: 'Shopify powers standalone ecommerce websites with themes, apps, and a checkout built around cards and global payment gateways. It\'s priced in US dollars and designed for merchants who want a fully independent web store — which brings a much steeper learning curve and cost for a merchant whose customers mostly discover and order through WhatsApp, Instagram, or TikTok rather than a Google search for a branded website.',
    pricingNote: 'Shopify\'s Basic plan starts at $19/month billed yearly ($27/month billed monthly), with Grow at $54/month and Advanced at $299/month (all yearly pricing) — plus a third-party payment fee of 2% down to 0.6% depending on tier if a merchant doesn\'t use Shopify Payments, which isn\'t available in most African countries. Frontstore starts free, with Pro at ₦1,500/month (roughly $1/month) and Legend at ₦5,000/month, plus a flat 1.5% transaction fee on every sale — the same fee regardless of tier.',
    bestFor: 'Merchants who want a fully independent branded website, plan to run a large app ecosystem (reviews, upsells, subscriptions), or sell primarily to customers outside Africa via search and paid ads.',
    strengths: [
      'The largest app and theme ecosystem of any ecommerce platform, for almost any feature imaginable',
      'Built for global scale — multi-currency, multi-language, and enterprise-grade infrastructure',
      'Extensive documentation, agency support, and hiring pool of Shopify-experienced developers',
    ],
    gaps: [
      'Priced in USD with no African payment gateway as the default — Shopify Payments isn\'t available in Nigeria, Kenya, Ghana, or most African markets, pushing merchants to third-party processors with added fees',
      'No native WhatsApp checkout — a Shopify order completes in a web cart, not as a message in the merchant\'s chat',
      'Significant setup time (themes, apps, payment gateway configuration) compared to a 2-minute WhatsApp storefront',
    ],
    featureRows: [
      { feature: 'Checkout destination', frontstore: 'Pre-filled order lands directly in the merchant\'s WhatsApp chat', competitor: 'Web-based cart and checkout on the merchant\'s own domain' },
      { feature: 'AI product listings', frontstore: 'Upload a photo → AI writes name, description, tags, and price', competitor: 'Sidekick AI assistant helps with store tasks; product entry is still manual' },
      { feature: 'Local payment rails', frontstore: 'Native Paystack, Flutterwave, and mobile money support', competitor: 'No native African payment gateway — relies on third-party processors with added fees' },
      { feature: 'Setup time', frontstore: 'Under 2 minutes to claim a link and publish a storefront', competitor: 'Hours to days of theme setup, app installs, and payment configuration' },
      { feature: 'Pricing model', frontstore: 'Free, Pro ~$1/mo (₦1,500), or Legend ~$3/mo (₦5,000), plus a flat 1.5% transaction fee', competitor: '$19–$299+/month (yearly pricing), plus 0.6%–2% third-party payment fees' },
      { feature: 'Built for', frontstore: 'Chat-first selling on WhatsApp, Instagram, and TikTok', competitor: 'Standalone branded websites at global scale' },
    ],
    switchReasons: [
      { title: 'Priced for a Nigerian merchant, not a US dollar business', body: 'Frontstore\'s naira pricing — even its Legend tier — is roughly a fraction of Shopify\'s entry tier, with no dollar-denominated bill to manage on a naira-earning business.' },
      { title: 'No payment gateway workaround needed', body: 'Shopify Payments doesn\'t operate in most African countries, so merchants end up configuring third-party processors and paying extra fees. Frontstore\'s Paystack and Flutterwave integration works out of the box.' },
      { title: 'The store meets customers where they already are', body: 'Most African social commerce happens inside WhatsApp and Instagram DMs, not on a merchant\'s own domain — Frontstore\'s checkout is built around that reality instead of assuming a customer will browse a separate website.' },
    ],
    faqs: [
      { question: 'Is Frontstore a good Shopify alternative for Nigeria?', answer: 'For merchants whose customers mainly order through WhatsApp, Instagram, or TikTok, Frontstore is built specifically for that flow at a fraction of Shopify\'s cost. Merchants who need a large app ecosystem or are selling globally through search and paid ads may still be better served by Shopify.' },
      { question: 'Does Shopify work with Nigerian payment providers?', answer: 'Shopify Payments isn\'t available in Nigeria or most African countries, so merchants typically connect a third-party processor and pay an added fee on top of their subscription. Frontstore integrates Paystack, Flutterwave, and mobile money natively.' },
      { question: 'Why is Shopify so much more expensive than Frontstore?', answer: 'Shopify is priced in US dollars for a global market and includes infrastructure for large catalogs, app ecosystems, and enterprise scale. Frontstore\'s ₦1,500/month Pro plan (or ₦5,000/month for Legend) reflects a narrower, WhatsApp-focused feature set built for African micro and small merchants.' },
    ],
  },
];

export function getVsCompetitor(slug: string): VsCompetitor | undefined {
  return VS_COMPETITORS.find((c) => c.slug === slug);
}
