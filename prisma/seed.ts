import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'us' },
      update: {},
      create: {
        name: 'US',
        slug: 'us',
        description: 'Latest news and updates from the United States',
        color: '#DC2626',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'world' },
      update: {},
      create: {
        name: 'World',
        slug: 'world',
        description: 'International news and global events',
        color: '#2563EB',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'politics' },
      update: {},
      create: {
        name: 'Politics',
        slug: 'politics',
        description: 'Political news, elections, and government updates',
        color: '#7C3AED',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Business news, corporate updates, and economy',
        color: '#059669',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'markets' },
      update: {},
      create: {
        name: 'Markets',
        slug: 'markets',
        description: 'Stock markets, financial news, and investment updates',
        color: '#D97706',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'opinion' },
      update: {},
      create: {
        name: 'Opinion',
        slug: 'opinion',
        description: 'Editorials, opinions, and analysis',
        color: '#DB2777',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'health' },
      update: {},
      create: {
        name: 'Health',
        slug: 'health',
        description: 'Health news, medical updates, and wellness tips',
        color: '#0891B2',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'entertainment' },
      update: {},
      create: {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Celebrity news, movies, music, and entertainment',
        color: '#EA580C',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tech' },
      update: {},
      create: {
        name: 'Tech',
        slug: 'tech',
        description: 'Technology news, gadgets, and innovation',
        color: '#4F46E5',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'style' },
      update: {},
      create: {
        name: 'Style',
        slug: 'style',
        description: 'Fashion, lifestyle, and style trends',
        color: '#BE185D',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'travel' },
      update: {},
      create: {
        name: 'Travel',
        slug: 'travel',
        description: 'Travel destinations, tips, and adventure stories',
        color: '#0D9488',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports',
        slug: 'sports',
        description: 'Sports news, scores, and athletic updates',
        color: '#16A34A',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'watch' },
      update: {},
      create: {
        name: 'Watch',
        slug: 'watch',
        description: 'Videos, documentaries, and visual content',
        color: '#6366F1',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'listen' },
      update: {},
      create: {
        name: 'Listen',
        slug: 'listen',
        description: 'Podcasts, audio stories, and music',
        color: '#A855F7',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create admin user
  const hash = await bcrypt.hash('Admin@2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@iremee.com' },
    update: {},
    create: {
      name: 'Admin IREMEE',
      email: 'admin@iremee.com',
      passwordHash: hash,
      role: 'ADMIN',
    },
  });

  // Create author user
  const authorHash = await bcrypt.hash('Author@2024!', 12);
  const author = await prisma.user.upsert({
    where: { email: 'gaby@iremee.com' },
    update: {},
    create: {
      name: 'Gaby The Motivator',
      email: 'gaby@iremee.com',
      passwordHash: authorHash,
      role: 'AUTHOR',
    },
  });

  console.log(`✅ Created users: ${admin.name}, ${author.name}`);

  // Create sample articles
  const sampleArticles = [
    {
      title: 'US Economy Shows Strong Growth in Q3',
      slug: 'us-economy-strong-growth-q3',
      excerpt: 'The US economy demonstrated robust growth in the third quarter, exceeding expectations with GDP rising by 3.2%.',
      content: '<p>The US economy demonstrated robust growth in the third quarter, exceeding expectations with GDP rising by 3.2%. This marks the strongest quarterly performance since early 2022.</p><p>Key drivers include consumer spending, business investments, and a resilient labor market. Economists remain optimistic about sustained growth through the end of the year.</p>',
      readTime: 3,
      categorySlug: 'us',
    },
    {
      title: 'Global Climate Summit Reaches Historic Agreement',
      slug: 'global-climate-summit-historic-agreement',
      excerpt: 'World leaders have reached a groundbreaking agreement at the Global Climate Summit, committing to reduce carbon emissions by 50% by 2030.',
      content: '<p>World leaders have reached a groundbreaking agreement at the Global Climate Summit, committing to reduce carbon emissions by 50% by 2030.</p><p>The agreement includes provisions for financial support to developing nations, technology transfer, and regular progress reviews. Environmental groups have praised the ambitious targets.</p>',
      readTime: 4,
      categorySlug: 'world',
    },
    {
      title: 'Election Results Shape New Political Landscape',
      slug: 'election-results-new-political-landscape',
      excerpt: 'Recent elections across several nations have significantly altered the political landscape, with new parties gaining ground and established faces facing unexpected challenges.',
      content: '<p>Recent elections across several nations have significantly altered the political landscape. New parties have gained ground while established faces faced unexpected challenges.</p><p>Analysts suggest this shift reflects changing voter priorities around economic stability, climate policy, and social issues. The coming months will reveal how these changes translate into policy.</p>',
      readTime: 5,
      categorySlug: 'politics',
    },
    {
      title: 'Tech Giants Report Record Quarterly Earnings',
      slug: 'tech-giants-record-earnings',
      excerpt: 'Major technology companies have reported exceptional quarterly results, driven by AI investments and cloud computing growth.',
      content: '<p>Major technology companies have reported exceptional quarterly results, driven by AI investments and cloud computing growth.</p><p>Revenue increases ranged from 15% to 35% year-over-year, with AI services emerging as a significant growth driver. Stock markets responded positively to the announcements.</p>',
      readTime: 3,
      categorySlug: 'business',
    },
    {
      title: 'Stock Markets Rally Amid Positive Economic Data',
      slug: 'stock-markets-rally-economic-data',
      excerpt: 'Global stock markets have surged following the release of better-than-expected economic indicators, including employment figures and manufacturing data.',
      content: '<p>Global stock markets have surged following the release of better-than-expected economic indicators. Employment figures and manufacturing data both exceeded analyst expectations.</p><p>The S&P 500 reached a new all-time high, while European and Asian markets also posted significant gains. Investor sentiment remains cautiously optimistic.</p>',
      readTime: 3,
      categorySlug: 'markets',
    },
    {
      title: 'Opinion: The Future of Remote Work',
      slug: 'opinion-future-remote-work',
      excerpt: 'As companies navigate the post-pandemic world, the debate over remote work continues. Here\'s why hybrid models may be here to stay.',
      content: '<p>As companies navigate the post-pandemic world, the debate over remote work continues. Hybrid models appear to be emerging as the preferred solution for many organizations.</p><p>Employees value flexibility, while employers seek to maintain collaboration and culture. The challenge lies in finding the right balance that works for both parties.</p>',
      readTime: 4,
      categorySlug: 'opinion',
    },
    {
      title: 'Breakthrough in Cancer Research Offers New Hope',
      slug: 'breakthrough-cancer-research-new-hope',
      excerpt: 'Scientists have announced a significant breakthrough in cancer treatment, with a new therapy showing promising results in clinical trials.',
      content: '<p>Scientists have announced a significant breakthrough in cancer treatment. A new therapy has shown promising results in clinical trials, particularly for certain types of resistant cancers.</p><p>The treatment works by targeting specific genetic markers, offering a more personalized approach to cancer care. Researchers are optimistic about broader applications in the coming years.</p>',
      readTime: 4,
      categorySlug: 'health',
    },
    {
      title: 'Summer Blockbuster Breaks Box Office Records',
      slug: 'summer-blockbuster-box-office-records',
      excerpt: 'The latest superhero movie has shattered box office records, earning $500 million in its opening weekend worldwide.',
      content: '<p>The latest superhero movie has shattered box office records, earning $500 million in its opening weekend worldwide.</p><p>Critics have praised the film\'s visual effects and storytelling, while audiences have responded enthusiastically. The success signals continued strength in the theatrical market despite streaming competition.</p>',
      readTime: 2,
      categorySlug: 'entertainment',
    },
    {
      title: 'Revolutionary AI Assistant Launches to Public',
      slug: 'revolutionary-ai-assistant-launches',
      excerpt: 'A new AI assistant with advanced reasoning capabilities has been released, promising to transform how people interact with technology.',
      content: '<p>A new AI assistant with advanced reasoning capabilities has been released to the public. The system demonstrates unprecedented ability to understand context and provide nuanced responses.</p><p>Early users report significant productivity improvements in writing, coding, and research tasks. The technology represents a major leap forward in AI development.</p>',
      readTime: 3,
      categorySlug: 'tech',
    },
    {
      title: 'Fashion Week Highlights Sustainable Trends',
      slug: 'fashion-week-sustainable-trends',
      excerpt: 'Major fashion houses embraced sustainability at this season\'s fashion weeks, with eco-friendly materials and ethical production taking center stage.',
      content: '<p>Major fashion houses embraced sustainability at this season\'s fashion weeks. Eco-friendly materials and ethical production took center stage on runways around the world.</p><p>Designers showcased innovative approaches to sustainable fashion, from recycled fabrics to zero-waste production techniques. The industry appears to be embracing environmental responsibility.</p>',
      readTime: 3,
      categorySlug: 'style',
    },
    {
      title: 'Hidden Gems: Underrated Travel Destinations for 2024',
      slug: 'underrated-travel-destinations-2024',
      excerpt: 'Discover the world\'s most underrated travel destinations that offer incredible experiences without the crowds of popular tourist spots.',
      content: '<p>Discover the world\'s most underrated travel destinations that offer incredible experiences without the crowds. From hidden beaches in Southeast Asia to historic towns in Eastern Europe.</p><p>These destinations provide authentic cultural experiences, stunning natural beauty, and excellent value for travelers seeking something different from the typical tourist trail.</p>',
      readTime: 4,
      categorySlug: 'travel',
    },
    {
      title: 'Championship Finals Set to Break Viewership Records',
      slug: 'championship-finals-viewership-records',
      excerpt: 'The upcoming championship finals are expected to attract record-breaking viewership, with fans around the world eagerly anticipating the showdown.',
      content: '<p>The upcoming championship finals are expected to attract record-breaking viewership. Fans around the world are eagerly anticipating the showdown between the two top teams.</p><p>Both teams have had exceptional seasons, and the matchup promises to be exciting. Analysts predict this could be one of the most-watched sporting events of the decade.</p>',
      readTime: 2,
      categorySlug: 'sports',
    },
    {
      title: 'Award-Winning Documentary Now Streaming',
      slug: 'award-winning-documentary-streaming',
      excerpt: 'The critically acclaimed documentary that won top honors at film festivals is now available on major streaming platforms.',
      content: '<p>The critically acclaimed documentary that won top honors at film festivals is now available on major streaming platforms. The film explores important social issues through compelling storytelling.</p><p>Viewers can expect powerful cinematography and thought-provoking content that has sparked conversations worldwide. It\'s a must-watch for anyone interested in documentary filmmaking.</p>',
      readTime: 2,
      categorySlug: 'watch',
    },
    {
      title: 'New Podcast Explores Stories of Innovation',
      slug: 'new-podcast-innovation-stories',
      excerpt: 'A new podcast series featuring interviews with innovators and entrepreneurs has launched, offering insights into creativity and success.',
      content: '<p>A new podcast series featuring interviews with innovators and entrepreneurs has launched. Each episode explores the stories behind breakthrough ideas and the people who created them.</p><p>Listeners gain valuable insights into the creative process, overcoming challenges, and building successful ventures. The podcast is available on all major platforms.</p>',
      readTime: 3,
      categorySlug: 'listen',
    },
  ];

  for (const art of sampleArticles) {
    const cat = categories.find((c) => c.slug === art.categorySlug);
    if (!cat) continue;
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        readTime: art.readTime,
        published: true,
        publishedAt: new Date(),
        categoryId: cat.id,
        authorId: author.id,
      },
    });
  }

  console.log(`✅ Created ${sampleArticles.length} sample articles`);
  console.log('\n🎉 Seeding complete!');
  console.log('\nAdmin credentials:');
  console.log('  Email: admin@iremee.com');
  console.log('  Password: Admin@2024!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
