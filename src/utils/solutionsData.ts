export interface SolutionSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface SolutionStep {
  title: string;
  body: string;
}

export interface SolutionFaq {
  question: string;
  answer: string;
}

export interface SolutionPage {
  slug: string;
  keyword: string;
  category: 'Getting Started' | 'By Business Type' | 'AI & Automation';
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  headline: string;
  headlineHighlight: string;
  subhead: string;
  directAnswer: string;
  sections: SolutionSection[];
  steps?: SolutionStep[];
  faqs: SolutionFaq[];
}

export const SOLUTION_PAGES: SolutionPage[] = [
  {
    slug: 'sell-on-whatsapp-nigeria',
    keyword: 'sell on WhatsApp in Nigeria',
    category: 'Getting Started',
    metaTitle: 'How to Sell on WhatsApp in Nigeria (2026 Guide)',
    metaDescription: 'A practical guide to selling on WhatsApp in Nigeria: setting up a catalog, taking orders without chat clutter, getting paid, and scaling past 20 daily orders.',
    eyebrow: 'WhatsApp Selling',
    headline: 'How to Sell on WhatsApp',
    headlineHighlight: 'in Nigeria',
    subhead: 'From a chat full of screenshots to an organized store customers can browse and order from in one tap.',
    directAnswer: 'To sell on WhatsApp in Nigeria, a merchant needs a way to show products, take orders, and get paid without spamming customers with dozens of images in a single chat thread. The fastest route is a dedicated storefront link — like frontstore.ng/yourbrand — that customers browse before ordering, where the order itself becomes a formatted WhatsApp message straight to the seller.',
    sections: [
      {
        heading: 'Why WhatsApp Status and Group Chats Stop Working',
        body: 'Most Nigerian sellers start with WhatsApp Status updates and personal chats, which works fine at low volume. Past a few orders a day, it breaks down in predictable ways.',
        bullets: [
          'Old products stay visible in Status long after they sell out, causing back-and-forth about availability',
          'There\'s no searchable catalog — a customer asking "do you have this in blue?" means scrolling through months of photos',
          'Price quoting happens manually in every single chat, which doesn\'t scale past a handful of daily conversations',
          'Order details (size, quantity, address) get lost between voice notes and typed messages',
        ],
      },
      {
        heading: 'How a WhatsApp Storefront Fixes This',
        body: 'A storefront link gives customers a place to browse before they ever message — organized by category, with real prices and photos. When a customer taps "Order," Frontstore generates a pre-filled WhatsApp message listing exactly what they picked: item, quantity, size, and price. The seller receives a clean order in their own chat, not a new dashboard to check separately.',
      },
      {
        heading: 'Getting Paid Without Chasing Transfers',
        body: 'Nigerian WhatsApp sellers typically collect payment by bank transfer, which means manually confirming each one. A storefront link can attach Paystack, Flutterwave, or mobile money checkout to the same order flow, so payment confirmation happens automatically instead of a screenshot sent back and forth.',
      },
    ],
    steps: [
      { title: 'Claim a store link', body: 'Pick a name and get a link like frontstore.ng/yourbrand — this takes under a minute.' },
      { title: 'Add products', body: 'Upload photos and let AI write the name, description, and suggested price for each item.' },
      { title: 'Share the link', body: 'Post it to WhatsApp Status, your Instagram bio, and any group chats where customers already find you.' },
      { title: 'Receive orders in chat', body: 'Every order lands as a formatted WhatsApp message with the buyer\'s selections, ready to confirm and fulfil.' },
    ],
    faqs: [
      { question: 'Do I need a website to sell on WhatsApp in Nigeria?', answer: 'No. A storefront link like frontstore.ng/yourbrand works entirely on a phone and doesn\'t require a domain, hosting, or any technical setup — customers browse it in their mobile browser before their order opens in WhatsApp.' },
      { question: 'Is it free to start selling on WhatsApp with Frontstore?', answer: 'Yes, merchants can claim a store and start listing products for free, with a flat ₦1,500/month or ₦15,000/year for the full feature set once the store is live.' },
      { question: 'How do buyers pay after messaging on WhatsApp?', answer: 'A buyer can pay by bank transfer, Paystack, Flutterwave, or mobile money — whichever the merchant has enabled — directly from the order flow, without leaving the chat context.' },
      { question: 'Can I still use my Instagram bio link for WhatsApp sales?', answer: 'Yes. Most sellers put the same storefront link in their Instagram bio, WhatsApp Status, and TikTok profile, so every channel drives to one organized catalog.' },
    ],
  },
  {
    slug: 'create-online-store-nigeria',
    keyword: 'create an online store in Nigeria',
    category: 'Getting Started',
    metaTitle: 'How to Create an Online Store in Nigeria in Under 2 Minutes',
    metaDescription: 'Compare traditional website builders to a WhatsApp-native storefront, and see the fastest way to create an online store in Nigeria without hosting or a domain.',
    eyebrow: 'Getting Started',
    headline: 'Create an Online Store',
    headlineHighlight: 'in Nigeria',
    subhead: 'Skip the domain, hosting, and theme setup — go from zero to a live storefront in one sitting.',
    directAnswer: 'Creating an online store in Nigeria no longer requires a domain, hosting, or a web developer. A merchant can claim a storefront link, upload product photos, and be live and taking orders within minutes — with WhatsApp, not a shopping cart, as the checkout step.',
    sections: [
      {
        heading: 'Traditional Website Builders vs. a WhatsApp-Native Store',
        body: 'A Shopify or WordPress store means picking a theme, connecting a payment gateway (most of which don\'t support Nigerian rails natively), and driving traffic to a standalone URL customers have to remember. A WhatsApp-native storefront skips all of that — the "traffic" is the audience a merchant already has on WhatsApp Status, Instagram, and TikTok.',
      },
      {
        heading: 'What You Actually Need to Launch',
        body: 'Three things: product photos, a name for the store, and a way to get paid. Everything else — the catalog layout, the order form, the payment page — is handled by the platform.',
        bullets: [
          'A phone with a camera — no professional photography required to start',
          'A business or personal bank account, or a Paystack/Flutterwave account for card payments',
          'A list of what you\'re selling and roughly what it costs',
        ],
      },
      {
        heading: 'Registration and CAC: Do You Need It First?',
        body: 'No — a merchant doesn\'t need CAC registration to start taking orders through a storefront link. Formal registration matters for scaling, opening a business bank account, or applying for a payment gateway\'s higher transaction limits, but it isn\'t a blocker to launching.',
      },
    ],
    steps: [
      { title: 'Choose your store name', body: 'This becomes your link — frontstore.ng/yourbusinessname.' },
      { title: 'Upload your first products', body: 'AI writes the listing copy from each photo, so there\'s no blank-page problem.' },
      { title: 'Connect a payment method', body: 'Add Paystack, Flutterwave, or bank transfer details so orders convert into confirmed payments.' },
      { title: 'Share and go live', body: 'Post the link everywhere your customers already are — no separate marketing push needed to launch.' },
    ],
    faqs: [
      { question: 'How much does it cost to create an online store in Nigeria?', answer: 'With Frontstore, listing products and setting up a storefront is free to start, with a flat ₦1,500/month or ₦15,000/year once live — considerably less than the $19+/month typical of global website builders.' },
      { question: 'Do I need a domain name to create an online store?', answer: 'No. A storefront link (frontstore.ng/yourbrand) works without buying a separate domain, though merchants who already own one can connect it later.' },
      { question: 'Is CAC business registration required to sell online in Nigeria?', answer: 'It\'s not required to launch a storefront and start taking orders. CAC registration becomes more relevant as a business scales, opens a corporate bank account, or needs higher payment processing limits.' },
      { question: 'How long does it actually take to create a store?', answer: 'Claiming a link and publishing a basic storefront takes under 2 minutes. Building out a full catalog depends on how many products a merchant is listing, but AI-generated descriptions remove most of the manual typing.' },
    ],
  },
  {
    slug: 'free-online-store-nigeria',
    keyword: 'free online store in Nigeria',
    category: 'Getting Started',
    metaTitle: 'Free Online Store in Nigeria: What "Free" Actually Costs',
    metaDescription: 'Most "free" online store builders charge hidden transaction fees or paywall checkout. See what\'s genuinely free in Nigeria and when platforms start charging.',
    eyebrow: 'Getting Started',
    headline: 'Free Online Store',
    headlineHighlight: 'in Nigeria',
    subhead: 'What "free" really means across the platforms Nigerian merchants compare before picking one.',
    directAnswer: 'A genuinely free online store in Nigeria should let a merchant list products and share a link without a subscription. Where platforms differ is what happens next — many "free" plans cap product counts, take a cut of every transaction, or paywall the checkout step itself once a merchant tries to actually get paid.',
    sections: [
      {
        heading: 'The Hidden Cost in Most "Free" Plans',
        body: 'Free tiers commonly restrict one of three things: how many products can be listed, how many orders can be processed before an upgrade is forced, or how much of each sale the platform keeps as a transaction fee. A merchant should check all three before assuming "free" means no ongoing cost.',
        bullets: [
          'Product limits — some free plans cap a catalog at 5–10 items',
          'Transaction fees — a percentage taken off every sale, even on a "free" plan',
          'Feature gating — checkout, custom domains, or payment integrations locked behind a paid tier',
        ],
      },
      {
        heading: 'What\'s Actually Free to Start',
        body: 'Claiming a storefront link, uploading products, and using AI to generate listings costs nothing upfront on Frontstore. The flat ₦1,500/month or ₦15,000/year applies once a merchant wants the full feature set live — there\'s no separate transaction fee taken from each sale on top of that.',
      },
      {
        heading: 'When It Makes Sense to Pay',
        body: 'A subscription is worth it the moment a store is generating real orders — at that point, ₦1,500/month is a small fraction of a single sale for most merchants, and it buys AI listings, WhatsApp checkout, and payment integration without a per-transaction cut.',
      },
    ],
    faqs: [
      { question: 'Is Frontstore completely free?', answer: 'Setting up a storefront and listing products is free to start. A flat ₦1,500/month or ₦15,000/year applies for the full feature set, with no additional transaction fee taken from sales.' },
      { question: 'Do free online store builders take a cut of my sales?', answer: 'Many do — a percentage-based transaction fee is common even on free tiers of other platforms. It\'s worth checking a platform\'s fee structure specifically, not just its subscription price, before assuming it\'s free.' },
      { question: 'What\'s the catch with free online store builders?', answer: 'Usually a cap on products, orders, or features rather than an outright cost — free tiers are often designed to get a merchant started and then charge once the store is actually working.' },
    ],
  },
  {
    slug: 'whatsapp-store-for-fashion-business',
    keyword: 'WhatsApp store for fashion business',
    category: 'By Business Type',
    metaTitle: 'WhatsApp Store for Fashion Businesses: Setup Guide (2026)',
    metaDescription: 'How fashion and boutique sellers use a WhatsApp storefront to manage size and color variants, drop new collections, and take orders without chat chaos.',
    eyebrow: 'Fashion & Boutique',
    headline: 'A WhatsApp Store Built for',
    headlineHighlight: 'Fashion Sellers',
    subhead: 'Handle sizes, colors, and fast-moving drops without losing track of what\'s actually left in stock.',
    directAnswer: 'A WhatsApp store for a fashion business needs to handle product variants — size and color — clearly, update stock the moment an item sells out, and let a buyer\'s exact selection (not just "the dress") land in the seller\'s WhatsApp as an order.',
    sections: [
      {
        heading: 'Why Fashion Sellers Outgrow Plain WhatsApp Fastest',
        body: 'Clothing and accessories sell in variants — a dress in three sizes and two colors is really six different items to track. Doing that over WhatsApp chat means constant "is this still available in medium?" messages, and a real risk of selling the same piece to two customers before either payment clears.',
      },
      {
        heading: 'Organizing Collections That Actually Move',
        body: 'Grouping products into named collections — "New Arrivals," "Weekend Wear," "Sold Out Restocked" — helps returning customers find what\'s new without scrolling through the entire catalog. Marking an item sold out the moment it moves prevents the double-sale problem entirely.',
        bullets: [
          'Set up size and color as selectable options on each listing so the exact variant is captured in the order',
          'Use AI-generated descriptions to cover fabric, fit, and sizing notes consistently across every item',
          'Mark items sold out in real time instead of relying on memory during a busy drop',
        ],
      },
      {
        heading: 'From Photo Shoot to Live Listing',
        body: 'Fashion sellers restock often, which makes manual listing the biggest time sink. Uploading a photo and letting AI generate the name, description, and suggested price turns a 20-item drop into minutes of work instead of an evening of typing.',
      },
    ],
    faqs: [
      { question: 'Can customers pick size and color before ordering?', answer: 'Yes — product variants let a buyer select size and color, and that exact choice is included in the WhatsApp order message the seller receives.' },
      { question: 'How do I stop selling the same item to two people?', answer: 'Marking an item as sold out or reducing its stock count the moment it sells removes it from the live storefront immediately, preventing a second customer from ordering the same piece.' },
      { question: 'Does the AI description tool work well for clothing?', answer: 'Yes — it\'s commonly used for fashion listings since it can draft consistent copy covering fit, fabric, and styling notes from a single product photo, which is normally the slowest part of listing a new drop.' },
    ],
  },
  {
    slug: 'grocery-online-store-nigeria',
    keyword: 'grocery online store Nigeria',
    category: 'By Business Type',
    metaTitle: 'How to Set Up a Grocery Online Store in Nigeria',
    metaDescription: 'A guide for Nigerian grocery and supermarket sellers on running a WhatsApp-based online store — daily stock updates, delivery zones, and repeat orders.',
    eyebrow: 'Groceries & Supermarkets',
    headline: 'A Grocery Store That Sells',
    headlineHighlight: 'Through WhatsApp',
    subhead: 'Keep stock current, manage delivery zones, and make reordering effortless for regular customers.',
    directAnswer: 'A grocery online store in Nigeria needs to handle two things plain WhatsApp struggles with: fast-changing stock (produce and perishables sell out daily) and delivery logistics tied to specific areas. A storefront that updates in real time and lets customers reorder their usual list solves both.',
    sections: [
      {
        heading: 'The Daily Stock Problem',
        body: 'Grocery inventory turns over faster than almost any other category — what\'s available in the morning may be gone by evening. A storefront where a seller can mark items out of stock in seconds keeps customers from ordering things that aren\'t there, which is the single biggest source of cancelled orders in grocery WhatsApp selling.',
      },
      {
        heading: 'Delivery Zones and Minimum Orders',
        body: 'Most grocery sellers only deliver within a radius of their base, and many set a minimum order value to make delivery worthwhile. Listing this clearly on the storefront — rather than explaining it fresh in every chat — cuts down on back-and-forth before an order is even confirmed.',
        bullets: [
          'List delivery areas and any minimum order value directly on the storefront',
          'Update stock levels daily, especially for perishables',
          'Group products by aisle-style categories (Produce, Pantry, Drinks, Household) so regulars can shop fast',
        ],
      },
      {
        heading: 'Making Reordering Effortless',
        body: 'Grocery customers tend to buy the same core list weekly. A storefront a customer can revisit and reorder from directly — rather than re-explaining their usual order in a new chat each time — turns one-off buyers into repeat customers.',
      },
    ],
    faqs: [
      { question: 'How do I handle items that sell out mid-day?', answer: 'Marking a product out of stock takes seconds on the storefront and removes it from what customers can order, which avoids taking payment for something that\'s no longer available.' },
      { question: 'Can I set a minimum order amount for delivery?', answer: 'Yes — delivery zones and minimum order requirements can be listed clearly on the storefront so customers see them before checkout instead of learning about them mid-chat.' },
      { question: 'Is this suitable for a small neighborhood store, not just a big supermarket?', answer: 'Yes — the setup works the same for a single neighborhood grocery shop delivering to a few nearby streets as it does for a larger supermarket, since both are limited by the same daily stock and delivery-zone challenges.' },
    ],
  },
  {
    slug: 'pharmacy-online-ordering',
    keyword: 'pharmacy online ordering',
    category: 'By Business Type',
    metaTitle: 'Pharmacy Online Ordering: A WhatsApp Setup Guide for Nigeria',
    metaDescription: 'How pharmacies and health vendors in Nigeria take online orders for medication and health essentials through a verified WhatsApp-based storefront.',
    eyebrow: 'Pharmacy & Health',
    headline: 'Pharmacy Online Ordering',
    headlineHighlight: 'Done Right',
    subhead: 'Take pre-orders for health essentials with the trust signals customers look for before they buy medication online.',
    directAnswer: 'Pharmacy online ordering works best as a pre-order and confirmation system rather than an instant checkout — customers browse available over-the-counter items and health essentials, place a request, and a pharmacist confirms availability and dosage details over WhatsApp before payment and delivery are finalized.',
    sections: [
      {
        heading: 'Trust Is the First Barrier',
        body: 'Customers are naturally more cautious ordering medication online than clothes or groceries. A verified seller badge, a clear business name, and a real WhatsApp number a customer can message directly all matter more here than in almost any other category.',
      },
      {
        heading: 'What to List — and What to Keep as a Conversation',
        body: 'Over-the-counter items (pain relief, first aid, vitamins, baby health essentials) list well as a straightforward catalog. Prescription items are better handled as a request — customer sends details, pharmacist confirms availability and price — kept inside the same WhatsApp thread rather than a public listing.',
        bullets: [
          'List OTC and health essentials as a browsable catalog with clear pricing',
          'Route anything prescription-related into a direct WhatsApp conversation for confirmation',
          'Use a verified seller badge to signal legitimacy to new customers',
        ],
      },
      {
        heading: 'Delivery Discretion Matters',
        body: 'Health purchases are often personal — packaging and delivery communication that doesn\'t announce the contents to neighbors or delivery riders is a real consideration pharmacy sellers factor into their fulfilment process.',
      },
    ],
    faqs: [
      { question: 'Can I sell prescription medication through a storefront?', answer: 'Prescription items are generally better handled as a direct WhatsApp conversation rather than a public listing, so a pharmacist can confirm the prescription and dosage before anything is dispatched. OTC and general health items work well as a standard catalog.' },
      { question: 'How do customers know a pharmacy storefront is legitimate?', answer: 'A verified seller badge, consistent business branding, and a direct WhatsApp line customers can message before ordering all help establish trust for a health-related purchase.' },
      { question: 'Does delivery preserve customer privacy?', answer: 'Sellers typically control their own packaging and delivery communication, and many choose discreet packaging for health-related orders as standard practice.' },
    ],
  },
  {
    slug: 'ai-product-description-generator',
    keyword: 'AI product description generator',
    category: 'AI & Automation',
    metaTitle: 'AI Product Description Generator for WhatsApp Sellers',
    metaDescription: 'Upload a product photo and get an AI-written name, description, tags, and suggested price — see how Frontstore\'s AI listing tool works for African merchants.',
    eyebrow: 'AI Listings',
    headline: 'An AI Product Description',
    headlineHighlight: 'Generator, Built for Sellers',
    subhead: 'Upload a photo. Get a name, description, tags, and a suggested price back in seconds.',
    directAnswer: 'An AI product description generator turns a single product photo into a complete listing — name, description, searchable tags, and a suggested price — removing the slowest part of setting up an online store: typing out dozens of listings by hand.',
    sections: [
      {
        heading: 'Why This Matters More for African Merchants',
        body: 'Many merchants restock frequently and sell high volumes of visually similar items — a boutique might list 30 new pieces in a week. Manually writing a name, description, and price for each one doesn\'t scale, and it\'s often the single biggest reason a merchant\'s online catalog falls behind what they actually have in stock.',
      },
      {
        heading: 'How It Works',
        body: 'A merchant uploads a photo of a product. The AI identifies what it is, drafts a clear product name and description, suggests relevant tags for search and filtering, and recommends a price based on the category. The merchant reviews and can edit anything before publishing — the AI drafts, it doesn\'t decide.',
        bullets: [
          'Works from a single photo — no need for a professional shoot or existing copy',
          'Generates tags that help buyers find products through the storefront\'s search and filters',
          'Suggests a starting price merchants can adjust based on their own margins',
        ],
      },
      {
        heading: 'What It Doesn\'t Replace',
        body: 'AI-generated copy is a starting point, not a final answer. Merchants selling something with specific technical detail, custom sizing, or a personal brand voice will still want to review and tweak the draft — the tool is built to save the first 80% of the work, not to remove human judgment entirely.',
      },
    ],
    faqs: [
      { question: 'Is the AI product description tool free?', answer: 'It\'s included as part of a Frontstore storefront subscription — flat ₦1,500/month or ₦15,000/year — with no separate charge per listing generated.' },
      { question: 'Can I edit what the AI writes?', answer: 'Yes. The AI draft is fully editable before publishing — merchants commonly use it as a starting point and adjust wording, pricing, or tags to match their own voice and margins.' },
      { question: 'Does it work for any type of product?', answer: 'It works best for visually identifiable products — clothing, food, electronics, beauty items, and similar categories. Highly technical or custom products may need more manual editing after the initial draft.' },
    ],
  },
  {
    slug: 'whatsapp-order-management',
    keyword: 'WhatsApp order management',
    category: 'AI & Automation',
    metaTitle: 'WhatsApp Order Management for Small Business Sellers',
    metaDescription: 'How to track orders, avoid missed sales, and manage customer requests when a business runs primarily through WhatsApp chat.',
    eyebrow: 'Order Management',
    headline: 'WhatsApp Order Management',
    headlineHighlight: 'Without the Chaos',
    subhead: 'Turn scattered chat messages into orders you can actually track from confirmed to delivered.',
    directAnswer: 'WhatsApp order management means keeping track of what was ordered, by whom, at what price, and what stage it\'s at — confirmed, paid, or delivered — without relying on scrolling back through a chat thread to remember. A structured order flow captures this automatically the moment a customer checks out through a storefront.',
    sections: [
      {
        heading: 'The Problem With Managing Orders in Raw Chat',
        body: 'When every order is just a message in a chat, a seller has to manually track which ones are paid, which are still pending, and which have shipped — usually in their head or a separate notebook. At more than a handful of daily orders, this is where mistakes happen: missed orders, double fulfilment, or forgetting to follow up on a pending payment.',
      },
      {
        heading: 'What Structured Order Tracking Looks Like',
        body: 'Every order placed through a storefront arrives with the buyer\'s selections, contact details, and price already attached, and moves through clear stages a seller can update as work progresses.',
        bullets: [
          'New — order just placed, awaiting confirmation',
          'Paid — payment confirmed, ready to fulfil',
          'Shipped/Out for delivery — customer notified of progress',
          'Completed — order closed out, available in order history',
        ],
      },
      {
        heading: 'Why This Matters for Repeat Customers',
        body: 'Order history isn\'t just for the seller\'s records — it means a returning customer\'s past orders, preferences, and contact details are already on hand, instead of starting from scratch in a new chat every time.',
      },
    ],
    faqs: [
      { question: 'Do I still receive the order as a WhatsApp message?', answer: 'Yes — the order is still delivered as a formatted WhatsApp message, but it\'s also tracked with a status a seller can update, rather than existing only as a message that gets buried in the chat over time.' },
      { question: 'Can I see a history of past orders from one customer?', answer: 'Yes, orders are tied to the buyer\'s details, so a merchant can see a customer\'s past purchases when they order again.' },
      { question: 'Is this useful for a solo seller, or only businesses with staff?', answer: 'It helps at any size — a solo seller benefits from not having to remember order status manually, and it becomes more important as order volume grows past what one person can track from memory.' },
    ],
  },
];

export function getSolutionPage(slug: string): SolutionPage | undefined {
  return SOLUTION_PAGES.find((s) => s.slug === slug);
}
