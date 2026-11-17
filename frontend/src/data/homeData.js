// Exact data extracted from https://leafinlifehealthcare.com/
// Structured to match the MongoDB models (Product, Testimonial, Blog, SiteConfig) for our Node.js + Express backend.

export const navigationLinks = [
  { id: 'home', label: 'Home', path: '/', active: true },
  { id: 'about', label: 'About Us', path: '/pages/about-us' },
  { id: 'shop', label: 'Shop', path: '/collections/all', badge: 'New' },
  { id: 'blog', label: 'blog ', path: '/blogs/news' },
  { id: 'contact', label: 'Contact', path: '/pages/contact' },
];

export const popularSearchTags = [
  { label: 'featured', query: 'featured' },
  { label: ' trendy', query: 'trendy' },
  { label: ' sale', query: 'sale' },
  { label: ' new', query: 'new' },
];

export const heroData = {
  slides: [
    {
      id: 'slide-1',
      heading: 'Ayurvedic Medicine Manufacturer in Kerala',
      description:
        'Welcome to Leaf in Life, one of the trusted Ayurvedic Medicine Manufacturers in Kerala, dedicated to promoting natural wellness through authentic Ayurvedic formulations and uncompromising quality. Experience the power of traditional healing with products crafted for modern lifestyles.',
      buttonText: 'VIew all',
      buttonLink: '/collections/all',
      desktopImage: '/assets/images/hero-desktop.jpg',
      mobileImage: '/assets/images/hero-mobile.jpg',
      boxBgColor: '#fef9ea',
      buttonBgColor: '#796346',
      bottomLink: '/products/ashtamrutham-vayugulika',
    },
  ],
};

export const slidingRibbon1Data = {
  id: 'ribbon-1',
  variant: 'green', // #586c38 background, #ffffff text
  items: [
    {
      id: 'r1-1',
      icon: 'star4',
      text: '100% Edible • Safe to Consume',
    },
    {
      id: 'r1-2',
      icon: 'heart',
      text: 'Trusted by thousands',
    },
    {
      id: 'r1-3',
      icon: 'shield',
      text: 'Quick & Effective Relief',
    },
    {
      id: 'r1-4',
      icon: 'award',
      text: ' Zero Side Effects',
    },
    {
      id: 'r1-5',
      icon: 'leaf',
      text: '100% ORGANIC & AYURVEDIC',
    },
    {
      id: 'r1-6',
      icon: 'check',
      text: 'No Chemicals Added',
    },
  ],
};

export const bentoData = {
  leftCard: {
    id: 'bento-left',
    image: '/assets/images/bento-left.jpg',
    link: '/products/bashpika-thulasi-7ml',
    buttonText: 'Buy Now',
    alt: 'Bashpika Thulasi 7ml',
  },
  centerTopText: {
    lines: [
      'Natural  ',
      'Ayurvedic ',
      'Solutions                                                      for Everyday',
      ' Wellness,',
      ' Made Just ',
      'for You',
    ],
  },
  centerBottomCard: {
    id: 'bento-center-bottom',
    image: '/assets/images/bento-center-bottom.jpg',
    link: '/products/sarvanga-thailam',
    buttonText: 'Buy Now',
    alt: 'Sarvanga Thailam',
  },
  rightTopCard: {
    id: 'bento-right-top',
    image: '/assets/images/bento-right-top.jpg',
    link: '/products/ashtamrutham-vayugulika',
    buttonText: 'Buy Now',
    alt: 'Ashtamrutham Vayugulika',
  },
  rightBottomCard: {
    id: 'bento-right-bottom',
    image: '/assets/images/bento-right-bottom.jpg',
    link: '/products/sukh-bodycare-oil-1',
    buttonText: 'Buy Now',
    alt: 'Sukh Bodycare Oil',
  },
};

export const initialTestimonials = [
  {
    _id: 'rev-1',
    name: 'Moinu',
    role: 'Influencer',
    rating: 5,
    avatar: '/assets/images/rev-moinu.jpg',
    content:
      'Since my first experience with Bashpika Thulasi during a ship journey to Malaysia, it has always been with me, in my bag, car, and even under my pillow. Today, many see me as its unofficial ambassador, simply because I genuinely trust and share my experience with others.',
  },
  {
    _id: 'rev-2',
    name: 'KOLLAM THULASI',
    role: 'Actor',
    rating: 5,
    avatar: '/assets/images/rev-kollam-thulasi.jpg',
    content:
      'Leaf in Life has become a part of my wellness routine. I appreciate how simple and natural the products feel. It’s comforting to know that everyday wellness can come from ingredients rooted in nature and tradition.',
  },
  {
    _id: 'rev-3',
    name: 'MUHAMMAD SHANIF NK',
    role: 'BRAND IDENTITY CREATOR',
    rating: 5,
    avatar: '/assets/images/rev-shanif.jpg',
    content:
      'What I like most about Leaf in Life is the simplicity of the experience. The products feel thoughtfully made, easy to use, and connected to natural wellness. It feels less like adding another product to my routine and more like returning to something traditional.',
  },
  {
    _id: 'rev-4',
    name: 'Nandhana',
    role: 'INFLUENCER',
    rating: 5,
    avatar: '/assets/images/rev-nandhana.jpg',
    content:
      'Simple, natural, and genuinely pleasant to use. Leaf in Life has introduced me to a different way of looking at everyday wellness. I’m happy to have discovered the brand.',
  },
  {
    _id: 'rev-5',
    name: 'UMMER N',
    role: 'TEACHER',
    rating: 5,
    avatar: '/assets/images/rev-ummer.jpg',
    content:
      'I was initially curious about the products, but after trying them, I understood the thought behind the brand. Leaf in Life brings traditional natural wellness into a form that feels relevant and easy to include in modern everyday life.',
  },
];

export const featuredCollectionHeader = {
  title: 'Ayurvedic Medicine Online Purchase Made Easy',
  description:
    'Relish convenient Ayurvedic medicine online purchase through our easy-to-use platform. From pain-relieving oils to immunity boosters, all is at your fingertips.',
  buttonText: 'view All',
  buttonLink: '/collections/all',
};

export const productCategories = [
  { id: 'all', label: 'All Products', slug: 'all', value: 'all' },
  { id: 'ayurvedic-drops', label: 'Ayurvedic Drops', slug: 'ayurvedic-drops', value: 'Ayurvedic Drops' },
  { id: 'ayurvedic-oils', label: 'Ayurvedic Oils', slug: 'ayurvedic-oils', value: 'Ayurvedic Oils' },
  { id: 'ayurvedic-tablets', label: 'Ayurvedic Tablets', slug: 'ayurvedic-tablets', value: 'Ayurvedic Tablets' },
  { id: 'ayurvedic-roll-on', label: 'Ayurvedic Roll On', slug: 'ayurvedic-roll-on', value: 'Ayurvedic Roll On' },
];

export const initialProducts = [
  {
    _id: '7362954788958',
    title: 'Bashpika Thulasi Premium Bottle',
    slug: 'bashpika-thulasi-7ml',
    url: '/products/bashpika-thulasi-7ml',
    vendor: 'Leaf In Life',
    sku: '1000',
    price: 112.5,
    formattedPrice: 'Rs. 112.50',
    primaryImage: '/assets/images/prod-p2.jpg',
    secondaryImage: '/assets/images/prod-pp2.jpg',
    images: [
      '/assets/images/prod-p2.jpg',
      '/assets/images/prod-pp2.jpg',
      '/assets/images/prod-p2-g3.jpg',
      '/assets/images/prod-p2-g4.jpg',
      '/assets/images/prod-p2-g5.jpg',
    ],
    category: 'Ayurvedic Drops',
    categorySlug: 'ayurvedic-drops',
    inStock: true,
    hasOutOfStockVariant: false,
    featuredRank: 4,
    bestSellingRank: 2,
    createdAt: '2024-03-15T10:00:00Z',
    description:
      'Bashpika Thulasi Premium Bottle by Leaf in Life Healthcare is a trusted Ayurvedic formulation for migraine care, made with 100% natural Ayurvedic ingredients. It supports comfort from migraine headaches and common concerns such as cold, sinus discomfort and seasonal allergies. For those seeking the Best Medicine for Migraine, this herbal formulation offers a natural wellness option. It can also support everyday comfort related to cold, allergies and pain and discomfort. Free from harmful chemicals, Bashpika Thulasi Premium Bottle is thoughtfully designed to complement a natural and healthy lifestyle.',
    descriptionHtml:
      '<p>Bashpika Thulasi Premium Bottle by Leaf in Life Healthcare is a trusted Ayurvedic formulation for migraine care, made with 100% natural Ayurvedic ingredients. It supports comfort from migraine headaches and common concerns such as cold, sinus discomfort and seasonal allergies. For those seeking the Best Medicine for Migraine, this herbal formulation offers a natural wellness option. It can also support everyday comfort related to cold, allergies and pain and discomfort. Free from harmful chemicals, Bashpika Thulasi Premium Bottle is thoughtfully designed to complement a natural and healthy lifestyle.</p>',
    variants: [],
    averageRating: 5.0,
    reviewCount: 7,
    reviews: [
      {
        id: 'rev-bt7-1',
        initial: 'H',
        rating: 5,
        date: '09/22/2026',
        author: 'HRIDYA LIJIN',
        title: 'Effective',
        body: "It's effective",
        verified: true,
      },
      {
        id: 'rev-bt7-2',
        initial: 'A',
        rating: 5,
        date: '09/03/2026',
        author: 'Anonymous',
        title: 'Super',
        body: 'Super',
        verified: true,
      },
      {
        id: 'rev-bt7-3',
        initial: 'L',
        rating: 5,
        date: '06/22/2026',
        author: 'Lokesh M',
        title: 'Very good and found better than other used till',
        body: 'Very good and found better than other used till now',
        verified: true,
      },
      {
        id: 'rev-bt7-4',
        initial: 'G',
        rating: 5,
        date: '12/17/2025',
        author: 'Gopakumar Menon',
        title: 'It is a multi purpose medicine and truly',
        body: 'It is a multi purpose medicine and truly effective. It has a fan following in our family',
        verified: true,
      },
      {
        id: 'rev-bt7-5',
        initial: 'V',
        rating: 5,
        date: '11/10/2025',
        author: 'Veena Sabu',
        title: 'Such a wonderful product it gave great relive to',
        body: 'Such a wonderful product it gave great relive to cold',
        verified: true,
      },
      {
        id: 'rev-bt7-6',
        initial: 'S',
        rating: 5,
        date: '10/18/2025',
        author: 'Sreejith K',
        title: 'Best Ayurvedic drops for sinus and headache',
        body: 'Instant soothing relief when used for steam inhalation and temple massage.',
        verified: true,
      },
      {
        id: 'rev-bt7-7',
        initial: 'R',
        rating: 5,
        date: '09/29/2025',
        author: 'Roshni Nair',
        title: 'Always in my travel bag',
        body: 'Compact premium bottle and 100% natural herbal formula. Highly recommended.',
        verified: true,
      },
    ],
    multicolumn: {
      subHeading: 'Bashpika Thulasi 7ml',
      title: 'Ayurvedic Remedy for Multiple Wellness Needs',
      description:
        'Bashpika Thulasi 7ml is a versatile Ayurvedic herbal product designed to support everyday wellness and provide comfort from common concerns such as headaches, migraine, sinus discomfort, cold-related symptoms and minor skin irritations. Formulated with carefully selected natural ingredients, it offers a convenient way to include traditional Ayurvedic care in your daily routine. For those looking for the Best Medicine for Migraine, Bashpika Thulasi 7ml can be a convenient addition to a natural wellness routine. Its easy application and compact 7ml format make it suitable for use at home or while travelling.',
      cards: [
        {
          heading: 'Why Choose Bashpika Thulasi 7ml?',
          contentHtml:
            '<ul><li>Made with natural ingredients inspired by traditional Ayurvedic practices.</li><li>Convenient and easy to apply whenever needed.</li><li>Can be used for multiple everyday wellness concerns.</li><li>Suitable for supporting comfort during cold and sinus discomfort.</li><li>Useful for headaches and migraine-related discomfort.</li><li>Compact packaging makes it easy to carry.</li><li>A practical choice for those exploring Ayurvedic wellness solutions.</li></ul>',
        },
        {
          heading: 'How to Use Bashpika Thulasi',
          contentHtml:
            '<p><strong>For headaches and migraine discomfort:</strong><br/>Take a small amount on your fingertips and gently massage it over the temples and other suitable areas.</p><p><strong>For steam inhalation:</strong><br/>Add 3–5 drops to hot water and carefully inhale the steam. Avoid getting too close to the hot water.</p><p><strong>For cold-related discomfort:</strong><br/>Apply a small amount to the chest and the area beneath the nose as appropriate. If you are searching for the Best Medicine for Migraine, this easy-to-use formulation can be considered as part of your personal wellness routine.</p><p><strong>For minor skin concerns:</strong><br/>Clean the affected area properly before applying a small amount. Avoid using it on deep or serious wounds, and discontinue use if irritation occurs.</p><ul><li>Bashpika Thulasi 7ml combines the convenience of modern use with the principles of traditional Ayurvedic care. Whether you are dealing with seasonal cold discomfort, sinus-related uneasiness, or occasional headaches, it can be a useful addition to your everyday wellness essentials. Choose Bashpika Thulasi 7ml when looking for the Best Medicine for Migraine and other common wellness needs.</li></ul>',
        },
      ],
    },
  },
  {
    _id: '7362149449822',
    title: 'Sarvanga Thailam',
    slug: 'sarvanga-thailam',
    url: '/products/sarvanga-thailam',
    vendor: 'Leaf In Life',
    sku: '1000',
    price: 150.0,
    formattedPrice: 'Rs. 150.00',
    primaryImage: '/assets/images/prod-p4.jpg',
    secondaryImage: '/assets/images/prod-pp4.jpg',
    images: [
      '/assets/images/prod-p4.jpg',
      '/assets/images/prod-pp4.jpg',
      '/assets/images/prod-p4-g3.jpg',
      '/assets/images/prod-p4-g4.jpg',
    ],
    category: 'Ayurvedic Oils',
    categorySlug: 'ayurvedic-oils',
    inStock: true,
    hasOutOfStockVariant: false,
    featuredRank: 5,
    bestSellingRank: 3,
    createdAt: '2024-02-10T10:00:00Z',
    description:
      'Leaf in Life Sarvanga Thailam is a premium best body massage oil formulated with traditional herbs to help relieve muscle pain, joint stiffness, back pain, and body fatigue. Regular massage supports relaxation, improves flexibility, promotes healthy circulation, and nourishes the skin naturally. Shop authentic Kerala Ayurvedic body massage oil online from Leaf in Life today.',
    descriptionHtml:
      '<p>Leaf in Life Sarvanga Thailam is a premium best body massage oil formulated with traditional herbs to help relieve muscle pain, joint stiffness, back pain, and body fatigue. Regular massage supports relaxation, improves flexibility, promotes healthy circulation, and nourishes the skin naturally. Shop authentic Kerala Ayurvedic body massage oil online from Leaf in Life today.</p>',
    variants: [],
    averageRating: 5.0,
    reviewCount: 3,
    reviews: [
      {
        id: 'rev-st-1',
        initial: 'M',
        rating: 5,
        date: '07/13/2026',
        author: 'Manoj D',
        title: 'It is really',
        body: 'It is really good',
        verified: true,
      },
      {
        id: 'rev-st-2',
        initial: 'M',
        rating: 5,
        date: '07/08/2026',
        author: 'Maya Madhu',
        title: 'Great product! It does exactly what the label promises',
        body: 'Great product! It does exactly what the label promises.',
        verified: true,
      },
      {
        id: 'rev-st-3',
        initial: 'D',
        rating: 5,
        date: '08/06/2025',
        author: 'DEEPAK S',
        title: 'Good And effective',
        body: 'Good And effective result',
        verified: true,
      },
    ],
    multicolumn: {
      subHeading: 'Sarvanga Thailam',
      title: 'Nature-Inspired Care for a Relaxed, Comfortable Body',
      description:
        'Give your body a soothing touch with Sarvanga Thailam, a traditional herbal massage oil created for everyday body care and relaxation. Its carefully selected herbal ingredients make it a comforting choice for massaging tired muscles, joints, the back, knees and other areas that experience daily stress. Whether you are looking to unwind after a busy day or add a traditional massage ritual to your wellness routine, Sarvanga Thailam offers a simple way to give your body the care it deserves. For those searching for the best body massage oil for regular self-care, it can be a valuable addition to a relaxing body-care routine.',
      cards: [],
    },
  },
  {
    _id: '7372488540254',
    title: 'Sukh Bodycare Oil',
    slug: 'sukh-bodycare-oil-1',
    url: '/products/sukh-bodycare-oil-1',
    vendor: 'Leaf In Life',
    sku: '1000',
    price: 180.0,
    formattedPrice: 'Rs. 180.00',
    primaryImage: '/assets/images/prod-p5.jpg',
    secondaryImage: '/assets/images/prod-pp5.jpg',
    images: [
      '/assets/images/prod-p5.jpg',
      '/assets/images/prod-pp5.jpg',
      '/assets/images/prod-p5-g3.jpg',
      '/assets/images/prod-p5-g4.jpg',
    ],
    category: 'Ayurvedic Oils',
    categorySlug: 'ayurvedic-oils',
    inStock: true,
    hasOutOfStockVariant: false,
    featuredRank: 6,
    bestSellingRank: 4,
    createdAt: '2024-04-05T10:00:00Z',
    description:
      'Sukh Bodycare Oil is the best oil for joint pain, made with 100% natural herbs to provide safe and effective relief. This pain relief oil helps ease joint pain, muscle pain, back pain, knee pain, swelling, and stiffness naturally. Our muscle pain relief oil supports daily mobility, postnatal care and faster recovery. Choose this ayurvedic oil for muscle pain from Leaf In Life for chemical-free care, long-lasting comfort and overall wellness.',
    descriptionHtml:
      '<p>Sukh Bodycare Oil is the best oil for joint pain, made with 100% natural herbs to provide safe and effective relief. This pain relief oil helps ease joint pain, muscle pain, back pain, knee pain, swelling, and stiffness naturally. Our muscle pain relief oil supports daily mobility, postnatal care and faster recovery. Choose this ayurvedic oil for muscle pain from Leaf In Life for chemical-free care, long-lasting comfort and overall wellness.</p>',
    variants: [],
    averageRating: 4.0,
    reviewCount: 1,
    reviews: [
      {
        id: 'rev-sbo-1',
        initial: 'A',
        rating: 4,
        date: '11/13/2025',
        author: 'Anonymous',
        title: 'Natural',
        body: 'Natural & Effective',
        verified: true,
      },
    ],
    multicolumn: {
      subHeading: 'Sukh Bodycare Oil',
      title: 'Ayurvedic Pain Relief Product',
      description:
        'Everyday movement, physical work, exercise, and long hours of sitting or standing can leave your body feeling tired, tight, and uncomfortable. A regular oil massage can be a simple way to relax the body and maintain comfortable movement as part of your daily self-care routine. Sukh Bodycare Oil is a herbal body massage oil formulated with carefully selected Ayurvedic ingredients. It is suitable for people who prefer traditional herbal oil massage for everyday muscle and joint care. If you are looking for the Best Oil for Joint Pain, Sukh Bodycare Oil can be added to your regular massage routine. Gentle massage with the oil helps provide a soothing experience for areas that commonly feel tired, tense, or stiff, including the knees, back, shoulders, and other joints.',
      cards: [
        {
          heading: 'How to Use Sukh Bodycare Oil',
          contentHtml:
            '<p><strong>For Joint and Muscle Massage: </strong>Take a suitable amount of Sukh Bodycare Oil and warm it gently. Apply the oil to the desired area and massage slowly using comfortable circular movements. Allow the massage to continue for several minutes.</p><p><strong>For Knee and Back Massage:</strong> Apply an appropriate amount of oil to the knees, lower back, shoulders, or other areas requiring massage. Massage gently and evenly. The oil may be left on the skin for around 30–45 minutes before bathing, if preferred.</p><p><strong>For Everyday Body Stiffness: </strong>After a physically demanding day or prolonged periods of work, apply the oil to areas that feel tired or tense. Use gentle massage strokes and allow the oil to remain on the skin for a comfortable period.</p><p><strong>For Postnatal Body Massage:</strong> When suitable, Sukh Bodycare Oil may be used for gentle postnatal body massage as part of a personal care routine. Postnatal use should be undertaken only when appropriate and with guidance from a qualified healthcare or massage professional.</p>',
        },
        {
          heading: 'Why Choose Sukh Bodycare Oil?',
          contentHtml:
            '<p>Sukh Bodycare Oil is designed for people who want to include traditional herbal oil massage in their everyday body-care routine. Its convenient application makes it suitable for targeted massage of commonly tired areas such as the knees, back, shoulders, and muscles.</p><p>Whether you want to relax after a busy day or maintain a consistent massage routine, Sukh Bodycare Oil offers a simple herbal approach to everyday body care. For those researching the Best Oil for Joint Pain, choosing a suitable massage oil and using it consistently can be an easy addition to a broader wellness routine.</p><p>Make Sukh Bodycare Oil a part of your regular self-care practice and enjoy the comforting experience of traditional herbal body massage. If your search is for the Best Oil for Joint Pain, Sukh Bodycare Oil can be considered as part of your regular joint and muscle massage routine.</p>',
        },
      ],
    },
  },
  {
    _id: '7362947743838',
    title: 'Ashtamrutham Lite Vayugulika',
    slug: 'ashtamrutham-vayugulika',
    url: '/products/ashtamrutham-vayugulika',
    vendor: 'Leaf In Life',
    sku: '1000',
    price: 30.0,
    formattedPrice: 'Rs. 30.00',
    primaryImage: '/assets/images/prod-p1.jpg',
    secondaryImage: '/assets/images/prod-pp1.jpg',
    images: [
      '/assets/images/prod-p1.jpg',
      '/assets/images/prod-pp1.jpg',
      '/assets/images/prod-p1-g3.jpg',
      '/assets/images/prod-p1-g4.jpg',
      '/assets/images/prod-p1-g5.jpg',
      '/assets/images/prod-p1-g6.jpg',
    ],
    category: 'Ayurvedic Tablets',
    categorySlug: 'ayurvedic-tablets',
    inStock: true,
    hasOutOfStockVariant: false,
    featuredRank: 1,
    bestSellingRank: 5,
    createdAt: '2024-03-01T10:00:00Z',
    description:
      'Ashtamrutham Lite Vayugulika is a gentle Ayurvedic formulation specially made for kids, elderly people, and those who are sensitive to strong or spicy medicines. Prepared using carefully selected natural Ayurvedic ingredients, it supports healthy digestion and helps provide relief from gas, acidity, bloating, indigestion, vomiting, and stomach discomfort.',
    descriptionHtml:
      '<p>Ashtamrutham Lite Vayugulika is a gentle Ayurvedic formulation specially made for kids, elderly people, and those who are sensitive to strong or spicy medicines. Prepared using carefully selected natural Ayurvedic ingredients, it supports healthy digestion and helps provide relief from gas, acidity, bloating, indigestion, vomiting, and stomach discomfort.</p><p>With a milder taste and a slight natural sweetness, Ashtamrutham Lite offers gentle digestive support while maintaining the trusted benefits of traditional Ayurvedic ingredients. Free from harmful chemicals and suitable for regular use, it is a comforting choice for the whole family.</p>',
    variants: [],
    averageRating: 5.0,
    reviewCount: 2,
    reviews: [
      {
        id: 'rev-alv-1',
        initial: 'A',
        rating: 5,
        date: '10/05/2026',
        author: 'Anonymous',
        title: 'Good',
        body: 'Good',
        verified: true,
      },
      {
        id: 'rev-alv-2',
        initial: 'D',
        rating: 5,
        date: '05/24/2026',
        author: 'Dr Shan P A',
        title: 'Ashtamrutham Gulika is not like other Vayu Gulikas (gastric pills)',
        body: 'Ashtamrutham Gulika is not like other Vayu Gulikas (gastric pills). Rather than just calling it a medicine, I prefer to refer to it as Siddha Vaidyam. Just as mentioned in the Puranas, it is as if blessings are combined with the medicine. The result is guaranteed.',
        verified: true,
      },
    ],
    multicolumn: {
      subHeading: 'Ashtamrutham Vayugulika',
      title: 'Ayurvedic Product for Digestive Support',
      description:
        'Find natural support for gas, acidity and bloating with Ashtamrutham Vayu Gulika—a trusted choice for digestive comfort. Made with carefully selected herbs, it is convenient to carry and suitable for everyday stomach discomfort, nausea or reduced appetite.',
      cards: [
        {
          heading: 'Why Choose Ashtamrutham Vayu Gulika?',
          contentHtml:
            '<p>Say goodbye to sudden stomach cramps and uncomfortable bloating after meals. Ashtamrutham Vayu Gulika is a traditional Ayurvedic formula designed to support comfortable digestion and help your stomach return to its natural rhythm.</p><ul><li>Helps ease gas, stomach discomfort, and acidity.</li><li>Supports relief from nausea, vomiting, fullness, and reduced appetite.</li><li>Prepared with a blend of selected Ayurvedic herbs.</li><li>A compact tablet that is simple to use whenever needed.</li><li>Easy to carry for use at home, during travel, or at work.</li><li>A convenient option for those seeking the Best Medicine for Digestion.</li></ul><p>This herbal formula supports your body’s natural digestive processes without unnecessary complexity. For those looking for the Best Medicine for Digestion, Ashtamrutham Vayu Gulika offers practical everyday digestive support.</p>',
        },
        {
          heading: 'How to Use Ashtamrutham Vayu Gulika',
          contentHtml:
            '<p><strong>Gas, Bloating, Acidity:</strong> Take 1–2 tablets with warm water after your meal or when discomfort begins.</p><p><strong>Vomiting or Nausea:</strong> Take one tablet when symptoms appear to help settle the stomach and promote comfort.</p><p><strong>Loss of Appetite:</strong> Take one tablet before food, twice daily, or follow the recommended usage on the product label.</p><p><strong>Before Travel or Big Meals:</strong> Take one tablet before heading out or after a heavy meal. This Best Medicine for Digestion supports comfortable digestion and may help reduce bloating, heaviness, and post-meal unease. Its convenient format makes digestive care simple for busy routines, meals, and journeys throughout day.</p>',
        },
      ],
    },
  },
  {
    _id: '7736655347806',
    title: 'Sukh Bodycare Roll On',
    slug: 'sukh-bodycare-oil-roll-on',
    url: '/products/sukh-bodycare-oil-roll-on',
    vendor: 'Leaf In Life',
    sku: '1000',
    price: 50.0,
    formattedPrice: 'Rs. 50.00',
    primaryImage: '/assets/images/prod-ppp6.jpg',
    secondaryImage: '/assets/images/prod-pp6.jpg',
    images: [
      '/assets/images/prod-ppp6.jpg',
      '/assets/images/prod-pp6.jpg',
      '/assets/images/prod-p6-g3.jpg',
      '/assets/images/prod-p6-g4.jpg',
    ],
    category: 'Ayurvedic Roll On',
    categorySlug: 'ayurvedic-roll-on',
    inStock: true,
    hasOutOfStockVariant: true,
    featuredRank: 7,
    bestSellingRank: 6,
    createdAt: '2024-06-12T10:00:00Z',
    description:
      'Sukh Bodycare Roll On is the best oil for joint pain, made with 100% natural herbs to provide safe and effective relief. This pain relief Roll On helps ease joint pain, muscle pain, back pain, knee pain, swelling, and stiffness naturally. Our muscle pain relief oil supports daily mobility, postnatal care and faster recovery. Choose this ayurvedic oil for muscle pain from Leaf In Life for chemical-free care, long-lasting comfort and overall wellness.',
    descriptionHtml:
      '<p>Sukh Bodycare Roll On is the best oil for joint pain, made with 100% natural herbs to provide safe and effective relief. This pain relief Roll On helps ease joint pain, muscle pain, back pain, knee pain, swelling, and stiffness naturally. Our muscle pain relief oil supports daily mobility, postnatal care and faster recovery. Choose this ayurvedic oil for muscle pain from Leaf In Life for chemical-free care, long-lasting comfort and overall wellness.</p>',
    variants: [
      {
        id: '43164581298270',
        size: '50 ML',
        price: 100.0,
        formattedPrice: 'Rs. 100.00',
        image: '/assets/images/prod-ppp6.jpg',
        available: true,
        active: true,
      },
      {
        id: '43164581331038',
        size: '20 ML',
        price: 50.0,
        formattedPrice: 'Rs. 50.00',
        image: '/assets/images/prod-ppp6.jpg',
        available: false,
        active: false,
      },
    ],
    averageRating: 5.0,
    reviewCount: 0,
    reviews: [],
    multicolumn: {
      subHeading: 'Sukh Bodycare Oil',
      title: 'Ayurvedic Pain Relief Product',
      description:
        'Everyday movement, physical work, exercise, and long hours of sitting or standing can leave your body feeling tired, tight, and uncomfortable. A regular oil massage can be a simple way to relax the body and maintain comfortable movement as part of your daily self-care routine. Sukh Bodycare Oil is a herbal body massage oil formulated with carefully selected Ayurvedic ingredients. It is suitable for people who prefer traditional herbal oil massage for everyday muscle and joint care. If you are looking for the Best Oil for Joint Pain, Sukh Bodycare Oil can be added to your regular massage routine. Gentle massage with the oil helps provide a soothing experience for areas that commonly feel tired, tense, or stiff, including the knees, back, shoulders, and other joints.',
      cards: [
        {
          heading: 'How to Use Sukh Bodycare Oil',
          contentHtml:
            '<p><strong>For Joint and Muscle Massage: </strong>Take a suitable amount of Sukh Bodycare Oil and warm it gently. Apply the oil to the desired area and massage slowly using comfortable circular movements. Allow the massage to continue for several minutes.</p><p><strong>For Knee and Back Massage:</strong> Apply an appropriate amount of oil to the knees, lower back, shoulders, or other areas requiring massage. Massage gently and evenly. The oil may be left on the skin for around 30–45 minutes before bathing, if preferred.</p><p><strong>For Everyday Body Stiffness: </strong>After a physically demanding day or prolonged periods of work, apply the oil to areas that feel tired or tense. Use gentle massage strokes and allow the oil to remain on the skin for a comfortable period.</p><p><strong>For Postnatal Body Massage:</strong> When suitable, Sukh Bodycare Oil may be used for gentle postnatal body massage as part of a personal care routine. Postnatal use should be undertaken only when appropriate and with guidance from a qualified healthcare or massage professional.</p>',
        },
        {
          heading: 'Why Choose Sukh Bodycare Oil?',
          contentHtml:
            '<p>Sukh Bodycare Oil is designed for people who want to include traditional herbal oil massage in their everyday body-care routine. Its convenient application makes it suitable for targeted massage of commonly tired areas such as the knees, back, shoulders, and muscles.</p><p>Whether you want to relax after a busy day or maintain a consistent massage routine, Sukh Bodycare Oil offers a simple herbal approach to everyday body care. For those researching the Best Oil for Joint Pain, choosing a suitable massage oil and using it consistently can be an easy addition to a broader wellness routine.</p><p>Make Sukh Bodycare Oil a part of your regular self-care practice and enjoy the comforting experience of traditional herbal body massage. If your search is for the Best Oil for Joint Pain, Sukh Bodycare Oil can be considered as part of your regular joint and muscle massage routine.</p>',
        },
      ],
    },
  },
  {
    _id: '7736673501278',
    title: 'Ashtamrutham Vayugulika',
    slug: 'ashtamrutham-vayugulika-copy',
    url: '/products/ashtamrutham-vayugulika-copy',
    vendor: 'Leaf In Life',
    sku: '1001',
    price: 10.0,
    formattedPrice: 'Rs. 10.00',
    primaryImage: '/assets/images/prod-v4.jpg',
    secondaryImage: '/assets/images/prod-v3.jpg',
    images: [
      '/assets/images/prod-v2.jpg',
      '/assets/images/prod-v4.jpg',
      '/assets/images/prod-v3.jpg',
      '/assets/images/prod-v1.jpg',
      '/assets/images/reel-vayu.jpg',
    ],
    category: 'Ayurvedic Tablets',
    categorySlug: 'ayurvedic-tablets',
    inStock: true,
    hasOutOfStockVariant: false,
    featuredRank: 2,
    bestSellingRank: 7,
    createdAt: '2024-06-20T10:00:00Z',
    description:
      'Ashtamrutham Vayugulika is one of the best medicine for digestion, prepared using carefully selected natural Ayurvedic ingredients. It helps support healthy digestion while providing relief from gas, acidity, bloating, indigestion and stomach discomfort. Traditionally used in Ayurveda, it is also valued as an Ayurvedic medicine for vomiting and digestive imbalance. Free from harmful chemicals, this trusted Ayurvedic formulation is suitable for regular use and helps maintain overall digestive health naturally.',
    descriptionHtml:
      '<p>Ashtamrutham Vayugulika is one of the best medicine for digestion, prepared using carefully selected natural Ayurvedic ingredients. It helps support healthy digestion while providing relief from gas, acidity, bloating, indigestion and stomach discomfort. Traditionally used in Ayurveda, it is also valued as an Ayurvedic medicine for vomiting and digestive imbalance. Free from harmful chemicals, this trusted Ayurvedic formulation is suitable for regular use and helps maintain overall digestive health naturally.</p>',
    variants: [
      {
        id: '43164653289566',
        size: '4.75 gm',
        price: 10.0,
        formattedPrice: 'Rs. 10.00',
        image: '/assets/images/prod-v2.jpg',
        available: true,
        active: true,
      },
      {
        id: '43164653322334',
        size: '10.42 gm',
        price: 50.0,
        formattedPrice: 'Rs. 50.00',
        image: '/assets/images/prod-v3.jpg',
        available: true,
        active: false,
      },
      {
        id: '43164653355102',
        size: '32.74 gm',
        price: 100.0,
        formattedPrice: 'Rs. 100.00',
        image: '/assets/images/prod-v1.jpg',
        available: true,
        active: false,
      },
    ],
    averageRating: 5.0,
    reviewCount: 0,
    reviews: [],
    multicolumn: {
      subHeading: 'Ashtamrutham Vayugulika',
      title: 'Ayurvedic Product for Digestive Support',
      description:
        'Find natural support for gas, acidity and bloating with Ashtamrutham Vayu Gulika—a trusted choice for digestive comfort. Made with carefully selected herbs, it is convenient to carry and suitable for everyday stomach discomfort, nausea or reduced appetite.',
      cards: [
        {
          heading: 'Why Choose Ashtamrutham Vayu Gulika?',
          contentHtml:
            '<p>Say goodbye to sudden stomach cramps and uncomfortable bloating after meals. Ashtamrutham Vayu Gulika is a traditional Ayurvedic formula designed to support comfortable digestion and help your stomach return to its natural rhythm.</p><ul><li>Helps ease gas, stomach discomfort, and acidity.</li><li>Supports relief from nausea, vomiting, fullness, and reduced appetite.</li><li>Prepared with a blend of selected Ayurvedic herbs.</li><li>A compact tablet that is simple to use whenever needed.</li><li>Easy to carry for use at home, during travel, or at work.</li><li>A convenient option for those seeking the Best Medicine for Digestion.</li></ul><p>This herbal formula supports your body’s natural digestive processes without unnecessary complexity. For those looking for the Best Medicine for Digestion, Ashtamrutham Vayu Gulika offers practical everyday digestive support.</p>',
        },
        {
          heading: 'How to Use Ashtamrutham Vayu Gulika',
          contentHtml:
            '<p><strong>Gas, Bloating, Acidity:</strong> Take 1–2 tablets with warm water after your meal or when discomfort begins.</p><p><strong>Vomiting or Nausea:</strong> Take one tablet when symptoms appear to help settle the stomach and promote comfort.</p><p><strong>Loss of Appetite:</strong> Take one tablet before food, twice daily, or follow the recommended usage on the product label.</p><p><strong>Before Travel or Big Meals:</strong> Take one tablet before heading out or after a heavy meal. This Best Medicine for Digestion supports comfortable digestion and may help reduce bloating, heaviness, and post-meal unease. Its convenient format makes digestive care simple for busy routines, meals, and journeys throughout day.</p>',
        },
      ],
    },
  },
  {
    _id: '7362182611038',
    title: 'Bashpika Thulasi',
    slug: 'bashpika-thulasi-premium-bottle',
    url: '/products/bashpika-thulasi-premium-bottle',
    vendor: 'Leaf In Life',
    sku: '1000',
    price: 95.0,
    formattedPrice: 'Rs. 95.00',
    primaryImage: '/assets/images/prod-bashpika-bnsb.jpg',
    secondaryImage: '/assets/images/prod-bashpika-bns.jpg',
    images: [
      '/assets/images/prod-bashpika-bnsb.jpg',
      '/assets/images/prod-bashpika-bns.jpg',
      '/assets/images/prod-bashpika-g3.jpg',
      '/assets/images/prod-bashpika-g4.jpg',
      '/assets/images/prod-bashpika-g5.jpg',
    ],
    category: 'Ayurvedic Drops',
    categorySlug: 'ayurvedic-drops',
    inStock: true,
    hasOutOfStockVariant: true,
    featuredRank: 3,
    bestSellingRank: 1,
    createdAt: '2024-01-20T10:00:00Z',
    description:
      'Leaf in Life Bashpika Thulasi is a natural Ayurvedic wellness remedy formulated to support relief from migraine headaches, cold, sinusitis, sneezing, runny nose and allergy-related discomfort. Its herbal formulation also helps soothe minor skin irritation, dandruff, burns and wounds. Suitable for regular use and steam inhalation, Bashpika Thulasi offers convenient natural support for respiratory health and everyday wellness.',
    descriptionHtml:
      '<p><strong>Leaf in Life Bashpika Thulasi</strong> is a natural Ayurvedic wellness remedy formulated to support relief from <strong>migraine headaches</strong>, cold, sinusitis, sneezing, runny nose and allergy-related discomfort. Its herbal formulation also helps soothe minor skin irritation, dandruff, burns and wounds. Suitable for regular use and steam inhalation, Bashpika Thulasi offers convenient natural support for respiratory health and everyday wellness.</p>',
    variants: [
      {
        id: '41609584574558',
        size: '10 ML',
        price: 170.0,
        formattedPrice: 'Rs. 170.00',
        image: '/assets/images/prod-bashpika-bnsb.jpg',
        available: false,
        active: true,
      },
      {
        id: '41609584607326',
        size: '5 ML',
        price: 95.0,
        formattedPrice: 'Rs. 95.00',
        image: '/assets/images/prod-bashpika-bnsb.jpg',
        available: true,
        active: false,
      },
    ],
    averageRating: 4.33,
    reviewCount: 6,
    reviews: [
      {
        id: 'rev-bt-1',
        initial: 'A',
        rating: 5,
        date: '07/01/2026',
        author: 'Anonymous',
        title: 'Effective!',
        body: 'Very much useful',
        verified: true,
      },
      {
        id: 'rev-bt-2',
        initial: 'A',
        rating: 5,
        date: '02/02/2026',
        author: 'Anonymous',
        title: "It'saGreat product and am highly satisfied with its usage",
        body: "It'saGreat product and am highly satisfied with its usage. Thanks",
        verified: true,
      },
      {
        id: 'rev-bt-3',
        initial: 'P',
        rating: 1,
        date: '01/07/2026',
        author: 'Paras Sehgal',
        title: 'Parcel was damaged',
        body: 'Parcel was damaged',
        verified: true,
      },
      {
        id: 'rev-bt-4',
        initial: 'M',
        rating: 5,
        date: '12/31/2025',
        author: 'Mohammed Shahid',
        title: 'Very Effective good',
        body: 'Very Effective good product',
        verified: true,
      },
      {
        id: 'rev-bt-5',
        initial: 'A',
        rating: 5,
        date: '11/21/2025',
        author: 'Anonymous',
        title: 'Very useful Product',
        body: 'Very useful Product,,👍👍',
        verified: true,
      },
      {
        id: 'rev-bt-6',
        initial: 'N',
        rating: 5,
        date: '10/14/2025',
        author: 'Nithin Raj',
        title: 'Authentic Kerala Ayurvedic Drops',
        body: 'Works fast for cold and nasal congestion.',
        verified: true,
      },
    ],
    multicolumn: {
      subHeading: 'Bashpika Thulasi Premium Bottle',
      title: 'Multipurpose Herbal Wellness Product',
      description:
        'Bashpika Thulasi is a multipurpose herbal wellness product prepared with natural ingredients and no added chemicals. It is designed to provide soothing support for migraine headaches, sinus discomfort, cold symptoms and nasal congestion. Its convenient bottle makes it easy to use at home or carry while travelling. It can be used for gentle topical application or steam inhalation as part of your everyday wellness routine.',
      cards: [
        {
          heading: 'Why Choose Bashpika Thulasi Premium Bottle?',
          contentHtml:
            '<ul><li>Bashpika Thulasi offers natural support for migraine headaches, sinus discomfort, cold, sneezing, and congestion.</li><li>Formulated with carefully selected herbal ingredients without added chemicals.</li><li>Suitable for steam inhalation to help provide a refreshing feeling during nasal congestion.</li><li>Easy topical application on the forehead and temples when experiencing migraine headaches or general head discomfort.</li><li>The compact premium bottle is convenient to keep at home, in your bag, or while travelling.</li><li>Its versatile formulation makes it useful for more than occasional headache discomfort.</li><li>A simple herbal wellness option for incorporating natural care into your daily routine.</li></ul>',
        },
        {
          heading: 'How to Use Bashpika Thulasi Premium Bottle',
          contentHtml:
            '<ul><li><strong>Headache or Migraine Support:</strong> Apply a few drops to the forehead or temples and gently massage. It can be used as part of your self-care routine when experiencing migraine headaches.</li><li><strong>Cold, Sneezing, or Nasal Congestion:</strong> Add 3–5 drops to hot water and inhale the steam for 5–10 minutes, keeping a comfortable distance from the steam.</li><li><strong>Skin Care:</strong> Apply a small amount to the required area using clean fingers or cotton, as appropriate.</li><li><strong>Sinus Discomfort:</strong> Use for steam inhalation or apply gently around the forehead and outer nose area, avoiding direct contact with the eyes.</li><li><strong>Daily Wellness:</strong> Use as part of a simple morning or evening routine whenever you want a refreshing herbal experience, including during occasional migraine headaches.</li></ul><p>Shake well before use. Store in a cool, dry place and keep away from direct sunlight.</p>',
        },
      ],
    },
  },
];

export const slidingRibbon2Data = {
  id: 'ribbon-2',
  variant: 'white', // #ffffff background, 2px solid #586c38 top/bottom border, #586c38 text
  items: [
    {
      id: 'r2-1',
      icon: 'leaf',
      text: '100% ORGANIC & AYURVEDIC',
    },
    {
      id: 'r2-2',
      icon: 'truck',
      text: 'Delivery in 4-5 day',
    },
    {
      id: 'r2-3',
      icon: 'shield',
      text: 'CLINICALLY TESTED & CERTIFIED',
    },
    {
      id: 'r2-4',
      icon: 'star4',
      text: 'MADE WITH NATURAL BOTANICALS',
    },
    {
      id: 'r2-5',
      icon: 'shield',
      text: 'Secure Payment',
    },
  ],
};

export const specificationData = {
  image: '/assets/images/spec-f.jpg',
  title: 'A Trusted Ayurvedic Brand for Modern Living',
  description:
    "At Leaf in Life Healthcare, we combine the timeless wisdom of Ayurveda with today's wellness requirements. As one of the leading Ayurvedic Medicine Manufacturers in Kerala, we focus on creating natural, chemical-free products that promote everyday health and well-being. Our signature product, Bashpika Thulasi, is a versatile Ayurvedic formulation prepared using carefully selected herbal ingredients. This 100% Ayurvedic solution helps support relief from migraine, headache, cold, sinus discomfort, allergies, cuts, burns, dandruff, agnail and more. It is also ideal for steam inhalation and routine wellness care.",
  buttonText: 'Shop now',
  buttonLink: '/products/bashpika-thulasi-7ml',
};

export const richTextData = {
  heading: 'Authentic Ayurvedic Excellence from Kerala',
  content:
    "With strong roots in Kerala's rich Ayurvedic heritage, we proudly continue the legacy of traditional healing through high-quality herbal formulations. As one of the dependable Ayurvedic Medicine Manufacturers in Kerala, we combine classical Ayurvedic knowledge with modern quality standards to deliver safe, effective, and trusted wellness solutions.",
};

export const initialVideoReels = [
  {
    id: 'VideoCard-video_card_FtpNbU',
    videoSrc: 'https://www.instagram.com/reel/DbgSNEmTD_9/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    reelId: 'DbgSNEmTD_9',
    customThumb: null,
    fallbackThumb: '/assets/images/bento-left.jpg',
  },
  {
    id: 'VideoCard-video_card_6GG6Xy',
    videoSrc: 'https://www.instagram.com/reel/Db74DT2DHMK/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    reelId: 'Db74DT2DHMK',
    customThumb: '/assets/images/reel-vayu.jpg',
    fallbackThumb: '/assets/images/reel-vayu.jpg',
  },
  {
    id: 'VideoCard-video_card_ydy3bM',
    videoSrc: 'https://www.instagram.com/reel/Db8kmRnSYnA/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    reelId: 'Db8kmRnSYnA',
    customThumb: null,
    fallbackThumb: '/assets/images/bento-center-bottom.jpg',
  },
  {
    id: 'VideoCard-video_card_LnqCJC',
    videoSrc: 'https://www.instagram.com/reel/Dbu_BmyS7md/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    reelId: 'Dbu_BmyS7md',
    customThumb: '/assets/images/reel-bash.jpg',
    fallbackThumb: '/assets/images/reel-bash.jpg',
  },
  {
    id: 'VideoCard-video_card_yeMaA4',
    videoSrc: 'https://www.instagram.com/reel/Dckn3-wjUeS/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==',
    reelId: 'Dckn3-wjUeS',
    customThumb: null,
    fallbackThumb: '/assets/images/bento-right-top.jpg',
  },
  {
    id: 'VideoCard-video_card_y8GmcM',
    videoSrc: 'https://www.instagram.com/reel/DcLSbZfFaFr/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==',
    reelId: 'DcLSbZfFaFr',
    customThumb: null,
    fallbackThumb: '/assets/images/bento-right-bottom.jpg',
  },
];

export const initialBlogs = [
  {
    _id: 'blog-1',
    title: 'Ayurvedic Medicine Manufacturers in Kerala: Pre...',
    fullTitle: 'Ayurvedic Medicine Manufacturers in Kerala: Preserving Herbal Knowledge for a Healthier Lifestyle',
    slug: 'ayurvedic-medicine-manufacturers-in-kerala-preserving-herbal-knowledge-for-a-healthier-lifestyle',
    url: '/blogs/news/ayurvedic-medicine-manufacturers-in-kerala-preserving-herbal-knowledge-for-a-healthier-lifestyle',
    author: 'info .leafinlife',
    date: '10 Nov 2026',
    image: '/assets/images/blog-1.webp',
  },
  {
    _id: 'blog-2',
    title: 'Best Oil for Joint Pain: A Natural Approach to ...',
    fullTitle: 'Best Oil for Joint Pain: A Natural Approach to Everyday Comfort',
    slug: 'best-oil-for-joint-pain-a-natural-approach-to-everyday-comfort',
    url: '/blogs/news/best-oil-for-joint-pain-a-natural-approach-to-everyday-comfort',
    author: 'info .leafinlife',
    date: '21 Sep 2026',
    image: '/assets/images/blog-2.jpg',
  },
  {
    _id: 'blog-3',
    title: 'Migraine Headache: Natural Wellness Support wit...',
    fullTitle: 'Migraine Headache: Natural Wellness Support with Bashpika Thulasi',
    slug: 'migraine-headache-natural-wellness-support-with-bashpika-thulasi',
    url: '/blogs/news/migraine-headache-natural-wellness-support-with-bashpika-thulasi',
    author: 'info .leafinlife',
    date: '09 Sep 2026',
    image: '/assets/images/blog-3.jpg',
  },
];

export const footerData = {
  logo: '/assets/images/logo-footer.webp',
  description:
    'Leaf in Life is dedicated to providing authentic Ayurvedic medicines and herbal healthcare products inspired by the rich tradition of Kerala Ayurveda. We are committed to delivering quality, purity, and natural wellness for a healthier life',
  socials: [
    {
      name: 'FB',
      url: 'https://www.facebook.com/leafinlife.healthcare.9/',
      icon: 'facebook',
    },
    {
      name: 'IN',
      url: 'https://www.instagram.com/leafinlife_healthcare/',
      icon: 'instagram',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@leafinlifehealthcare',
      icon: 'youtube',
    },
  ],
  shopLinks: [
    { label: 'Bashpika Thulasi', path: '/products/bashpika-thulasi-premium-bottle' },
    { label: 'Bashpika Thulasi 7ml', path: '/products/bashpika-thulasi-7ml' },
    { label: 'Ashtamrutham Vayugulika', path: '/products/ashtamrutham-vayugulika' },
    { label: 'Sarvanga Thailam', path: '/products/sarvanga-thailam' },
  ],
  newsletterHeading: 'Buy Directly from Trusted Ayurvedic Products Manufacturers India',
  newsletterText:
    'Experience authentic Ayurvedic wellness with Leaf in Life, one of the trusted Ayurvedic Products Manufacturers India.Backed by 40+ years of expertise, we offer premium herbal healthcare products inspired by traditional Kerala Ayurveda, ensuring quality, purity, and natural wellness.',
  copyrightText: '© Copyright, Leaf In Life, 2026 | Developed by ',
  developerName: 'BrandKhalifa',
  developerUrl: 'https://www.brandkhalifa.com/',
};

