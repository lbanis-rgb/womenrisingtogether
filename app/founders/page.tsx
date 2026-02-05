export default function FoundersPage() {
  return (
    <div className="font-sans bg-white">
      {/* Brand Logo Section */}
      <section className="bg-gradient-to-b from-gray-50 to-gray-50 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <img
            src={process.env.NEXT_PUBLIC_BRAND_LOGO_URL}
            alt="Brand Logo"
            className="h-16 w-auto"
          />
        </div>
      </section>

      {/* Hero Header Section */}
      <section id="hero-header" className="relative bg-gradient-to-b from-gray-50 to-white pt-12 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
              Limited Founding Leader Spots
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
            Become a Founding Leader <span className="text-brand-600">to Actionera Academy</span>
          </h1>
        </div>
      </section>

      {/* Hero Content Section */}
      <section id="hero-content" className="relative bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <p className="text-xl text-gray-600 leading-relaxed">
                We're inviting a small number of expert leaders to help shape this community from the beginning — with
                full creator access, lifetime benefits, visibility, and built-in ways to share your expertise.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-circle-check text-brand-500 text-xl"></i>
                  </div>
                  <span className="text-gray-700 font-medium">Lifetime access with full "Create" permissions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-circle-check text-brand-500 text-xl"></i>
                  </div>
                  <span className="text-gray-700 font-medium">
                    Lead groups, host events, and build private experiences
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-circle-check text-brand-500 text-xl"></i>
                  </div>
                  <span className="text-gray-700 font-medium">
                    Publish content, create courses, and feature your offers
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-circle-check text-brand-500 text-xl"></i>
                  </div>
                  <span className="text-gray-700 font-medium">Create your own AI Mentor to scale your guidance</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-circle-check text-brand-500 text-xl"></i>
                  </div>
                  <span className="text-gray-700 font-medium">Limited to X Founding Leader spots</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 italic">Available until 25 spots are filled.</p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center border border-gray-200">
                <img
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/XPYZqTkHKUezklygXKVAtUhWQWm1%2F9299ed61-6619-432d-9f18-daad08f3cf55.png"
                  alt="modern community platform dashboard showing member feed, groups, and engagement metrics with clean premium interface design"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-users text-brand-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">25</p>
                    <p className="text-sm text-gray-600">Spots Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Header Section */}
      <section id="vision-header" className="pt-24 pb-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight text-balance">
            This Community Is Built For People Who Want to Go Deeper — and Lead
          </h2>
        </div>
      </section>

      {/* Vision Content Section */}
      <section id="vision" className="pb-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-brand-50 rounded-2xl shadow-xl overflow-hidden aspect-video flex items-center justify-center border border-gray-200">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/community-group-image-Y4Vv49m4TMagbGFYrlIN41GTBz51Ad.png"
                  alt="Diverse group of professionals collaborating around a table with laptops, tablets and charts, sharing ideas in a modern meeting setting"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  This community is designed around a clear focus:{" "}
                  <span className="text-gray-900 font-bold">helping people share their message with the world.</span>
                </p>
                <p>
                  It's for people who want real growth through connection, learning, and action — not just content
                  consumption.
                </p>
                <p>Members come here to build relationships, gain insight, and move forward with support.</p>
              </div>
              <div className="bg-gradient-to-br from-brand-50 to-gray-50 rounded-xl p-8 border border-brand-100 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Who it's for:</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-star text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Experts, practitioners, coaches, creators, and guides</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-star text-brand-500 mt-1"></i>
                    <span className="text-gray-700">
                      People building a message, movement, or mission-driven business
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-star text-brand-500 mt-1"></i>
                    <span className="text-gray-700">
                      Leaders who want visibility, credibility, and aligned opportunities
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-star text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Members who value contribution, not just consumption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Experience Section */}
      <section id="member-experience" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What Every Member Can Experience Here</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              At any membership level, people gain access to a living ecosystem built for connection, learning, and
              momentum.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-users text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Connection</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Community feed and shared conversations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Discover members via the directory</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Messaging and relationship-building</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-layer-group text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Groups & Experiences</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Join groups by topic and intent</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Participate in guided discussions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Attend community experiences and live sessions</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-graduation-cap text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Learning & Growth</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Education content shared by selected contributors</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Courses for deeper transformation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Tools and resources to support action</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-toolbox text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tools & Resources</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Practical tools created by the community owner</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Frameworks, guides, templates, and planners</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Resources designed to support real-world action</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-robot text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Driven Support</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">AI Mentors designed around specific topics and outcomes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Guided conversations that support clarity and progress</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">On-demand support available anytime</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-user-tie text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Access to Leading Experts</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">A curated group of respected experts and leaders</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Live trainings, shared content, and exclusive experiences</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Access to expert-led products and services inside the community</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">The Core Community Experience</h2>
          </div>
          <div className="space-y-32">
            {/* Feature 01 - Member Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Feature 01
                </div>
                <h3 className="text-4xl font-bold text-gray-900">Member Feed</h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  A central place for updates, insights, and conversation — where members actually engage and
                  contribute.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Real-time updates and member posts</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Rich media support for images, videos, and links</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Engagement through comments, reactions, and shares</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-brand-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/memberfeedimage.png-PQfinrHp8BgzztCYvB31k5CZUc9xit.jpeg"
                    alt="Member Feed illustration showing desktop and mobile views of social posts with likes, comments, and user avatars"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Feature 02 - Groups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="bg-gradient-to-br from-gray-100 to-brand-50 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/groupsimage.png-F4MLX0KNzNpQSbLd0quwcJbeV7R6WT.jpeg"
                    alt="Groups illustration showing Business Growth, Health & Fitness, and Personal Development group cards with Join Group buttons"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-block bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Feature 02
                </div>
                <h3 className="text-4xl font-bold text-gray-900">Groups</h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Focused spaces for real discussion, accountability, and transformation — guided by leaders and
                  members.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Topic-specific and intent-based groups</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Public and private group options</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Leader-guided discussions and accountability</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 03 - Member Directory + Messaging */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Feature 03
                </div>
                <h3 className="text-4xl font-bold text-gray-900">Member Directory + Messaging</h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Find aligned people, connect directly, and build relationships inside a trusted ecosystem.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Searchable member profiles with expertise and interests</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Direct messaging for one-on-one connections</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Filter by location, expertise, and interests</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-brand-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Directory-inboximage.png-m7QmuO1eAEXhtddsRcdAbMRKPKMAB6.jpeg"
                    alt="Directory and Inbox illustration showing member listings with Message buttons on the left and chat conversation interface on the right"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Feature 04 - Community Events */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="bg-gradient-to-br from-gray-100 to-brand-50 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/communityeventsimage-Vkl8exiOOo8ImCMC0hSxAWoUyF18Kd.png"
                    alt="Community Events illustration showing Live Workshop, Expert Q&A Session, and Networking Meetup with View Event buttons and calendar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <div className="inline-block bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Feature 04
                </div>
                <h3 className="text-4xl font-bold text-gray-900">Community Events</h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  A curated directory of upcoming events shared by community members — from virtual workshops and summits to in-person experiences. Community Events help members discover what's happening and explore opportunities aligned with their interests.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Upcoming virtual and in-person events shared by community members</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Easy discovery of aligned workshops, summits, trainings, and experiences</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <i className="fa-solid fa-arrow-right text-brand-500 mt-1"></i>
                    <span className="text-gray-700">Direct links to external registration and event pages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Education Powered by Experts and Proven Voices
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This community features content from chosen experts and leaders — so members can learn from real
              experience, not theory.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-brand-100">
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/4eeec44006-7d391b2c10df1c0bfabc.png"
                      alt="professional expert leader portrait, confident speaker, thought leader headshot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Alex Morgan</h3>
                <p className="text-brand-600 text-center font-semibold mb-4">Community Leader · Practitioner · Guide</p>
                <p className="text-gray-600 text-center mb-6">
                  A respected voice actively contributing to the community through real-world experience, practical frameworks, and lived insight. Alex focuses on helping people move from clarity to action in their work and message, emphasizing progress over theory and meaningful contribution over noise.
                </p>
                <div className="flex justify-center space-x-3">
                  <a href="#" className="text-gray-600 hover:text-brand-600 transition">
                    <i className="fa-brands fa-linkedin text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-brand-600 transition">
                    <i className="fa-brands fa-twitter text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-brand-600 transition">
                    <i className="fa-solid fa-globe text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition">
                  <div className="h-48 bg-gradient-to-br from-brand-100 to-gray-100 flex items-center justify-center">
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/XPYZqTkHKUezklygXKVAtUhWQWm1%2F9299ed61-6619-432d-9f18-daad08f3cf55.png"
                      alt="video content thumbnail, educational webinar, online course preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Video</span>
                    <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">Building Momentum Through Focused Action</h4>
                    <p className="text-gray-600 text-sm">A guided video experience breaking down key concepts, practical strategies, and real examples members can apply immediately. Designed to support understanding, reflection, and forward movement — not passive watching.</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-brand-100 flex items-center justify-center">
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/90660d9a2c-a174734f25823e795df7.png"
                      alt="article blog post featured image, educational content, learning resource"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Article</span>
                    <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">Why Most Communities Fail — and What Actually Creates Engagement</h4>
                    <p className="text-gray-600 text-sm">A written deep dive exploring core ideas, patterns, and lessons drawn from real experience. Articles are designed to spark insight, challenge assumptions, and offer clear takeaways members can reflect on or discuss inside the community.</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition">
                  <div className="h-48 bg-gradient-to-br from-brand-100 to-gray-100 flex items-center justify-center">
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/89bbfceebd-4a260ead314f9351622c.png"
                      alt="podcast audio content visual, microphone setup, audio learning resource"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Audio</span>
                    <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">Clarity, Consistency, and the Long Game</h4>
                    <p className="text-gray-600 text-sm">Audio content for members who prefer to learn on the go. These sessions share perspective, stories, and guidance in a conversational format — ideal for reflection during walks, commutes, or quiet thinking time.</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-brand-100 flex items-center justify-center">
                    <img
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/63a9fc1774-48a7d784a39b7992aac1.png"
                      alt="downloadable resource template, workbook, toolkit visual"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Document</span>
                    <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">Guided Framework: From Idea to Action</h4>
                    <p className="text-gray-600 text-sm">Downloadable tools designed to support real implementation. Documents may include worksheets, frameworks, templates, or guided exercises members can use to apply what they're learning inside the community.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 text-center">
            <p className="text-gray-700 font-medium">
              <i className="fa-solid fa-star text-brand-500 mr-2"></i>
              Founding Leaders can contribute content and be featured as a trusted voice.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Courses for Deeper Transformation</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Courses inside the community are designed to create real change through structured learning — including
              free courses, member-level courses, and paid courses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-xl p-8 border border-green-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-gift text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Courses</h3>
              <p className="text-gray-600 mb-6">Lead generation + onboarding into the community</p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-green-500 mt-1"></i>
                  <span className="text-gray-700">Open to all visitors</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-green-500 mt-1"></i>
                  <span className="text-gray-700">Introduction to community value</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-green-500 mt-1"></i>
                  <span className="text-gray-700">Gateway to membership</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl shadow-xl p-8 border border-brand-200 hover:shadow-2xl transition transform scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-crown text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Member-Level Courses</h3>
              <p className="text-gray-600 mb-6">Included for certain membership levels</p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Exclusive to paying members</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Core transformation content</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-brand-500 mt-1"></i>
                  <span className="text-gray-700">Ongoing learning path</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-xl p-8 border border-purple-100 hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-gem text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Paid Courses</h3>
              <p className="text-gray-600 mb-6">Premium deep dives offered by selected creators</p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                  <span className="text-gray-700">Advanced specialized training</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                  <span className="text-gray-700">Expert-led deep dives</span>
                </li>
                <li className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-purple-500 mt-1"></i>
                  <span className="text-gray-700">Revenue opportunity for creators</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-100 to-brand-50 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-gray-200">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/courseimage-rjm07SbzflFSWiYieCBdJrBywLMSzX.png"
                alt="Mindful Leadership Foundations course interface showing progress tracking, module listings, and lesson navigation with 34% completion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                A Place to Feature Offers Without Feeling 'Salesy'
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Selected members can share aligned products and services — like coaching, services, programs, and
                resources — with a warm, relevant audience.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-badge-check text-brand-500 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Feature coaching and service offers</h4>
                    <p className="text-gray-600">Showcase your expertise through your offerings</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-badge-check text-brand-500 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Create visibility with aligned members</h4>
                    <p className="text-gray-600">Reach people who already value what you do</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-badge-check text-brand-500 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Build credibility through trusted association</h4>
                    <p className="text-gray-600">Your presence in the community adds authority</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <i className="fa-solid fa-badge-check text-brand-500 text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Drive leads from community traffic</h4>
                    <p className="text-gray-600">Convert engaged members into clients</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-brand-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-gray-200">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/productsserviesimage-AW5vOGKg7uWcTifSscKSQVRzRf3n6b.png"
                  alt="Services and Products illustration showing a support representative with headset and lightbulb ideas on the left, and a shopping bag with digital products, books, and media content on the right"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Mentors Section */}
      <section id="ai-mentors" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-purple-100 to-brand-100 text-purple-700 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide mb-6">
              <i className="fa-solid fa-sparkles mr-2"></i>
              Game-Changing Feature
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI Mentors: Personalized Transformation at Scale
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              One of the most powerful tools in the community is AI Mentors — focused AI chat experiences designed
              around specific outcomes. Members can use mentors to get guided support, and Founding Leaders can create
              mentors to scale their expertise.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-purple-50 to-brand-50 rounded-2xl p-8 border border-purple-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-brain text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Targeted AI guidance with clear intent and outcomes
                    </h4>
                    <p className="text-gray-600">Each mentor is designed around a specific transformation or goal</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-8 border border-brand-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-bullseye text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Mentors built around specific topics and transformations
                    </h4>
                    <p className="text-gray-600">From mindset shifts to technical skills to business strategies</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-brand-50 rounded-2xl p-8 border border-purple-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Founding Leaders can create their own mentors</h4>
                    <p className="text-gray-600">Package your expertise into an AI-powered guide that serves members 24/7</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-8 border border-brand-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-rocket text-white text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Your expertise can support people 24/7 without 1:1 burnout
                    </h4>
                    <p className="text-gray-600">Scale your impact while maintaining quality guidance</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-brand-100 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border-2 border-purple-200">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0aac170124-e94c3713179dbda6e10e-qeaDjRyo9sCzLjuQX4bSonM8glLZQE.png"
                  alt="72-Hour Emergency Planning Coach AI mentor interface showing personalized guidance, starter questions, and chat functionality"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-brand-500 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-comments text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">24/7</p>
                    <p className="text-sm text-gray-600">Always Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Invitation Section */}
      <section id="invitation" className="py-24 px-6 bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <span className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide">
              Exclusive Opportunity
            </span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">We're Opening a Limited Number of Founding Leader Spots</h2>
          <p className="text-xl lg:text-2xl mb-8 leading-relaxed opacity-95">
            Founding Leaders are the visible guides and creators inside this ecosystem. They help shape the culture,
            lead experiences, and contribute expertise — while receiving lifetime access and full creation permissions.
          </p>
          <div className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-8 py-4 mb-12">
            <p className="text-2xl font-bold">
              <i className="fa-solid fa-hourglass-half mr-3"></i>
              Limited to X Founding Leaders — available until filled.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center border border-white/20">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/actioneraacademy-homeimage-DgutaZ1nXlS7xc5Bz9MlXrvzPPwqJa.jpg"
              alt="Actionera Academy logo with dark blue gradient background and elegant curved lines"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Everything Included Section */}
      <section id="everything-included" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Founding Leader vs Top-Level Member</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly what makes the Founding Leader lifetime deal the ultimate value
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl shadow-2xl p-10 border-2 border-brand-200 transform lg:scale-105">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide mb-4">
                  <i className="fa-solid fa-crown mr-2"></i>
                  Best Value
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Founding Leader</h3>
                <p className="text-brand-700 font-semibold">Lifetime Access</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Lifetime access</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Full "Create" permissions</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Create groups + private groups</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Create and host events</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Create AI Mentors</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Publish content + be featured</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Create courses (lead gen or paid)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Promote products and services</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Maximum visibility inside the community</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-gray-900 mb-2">$997</p>
                <p className="text-gray-600 font-medium">One-time payment • Lifetime value</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Top-Level Member</h3>
                <p className="text-gray-600 font-semibold">Monthly Subscription</p>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-gray-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Monthly subscription (example: $99+/mo)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-gray-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Access to community and member-level content</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-check text-gray-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Some creation access (limited)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-xmark text-red-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Not all features unlocked</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-xmark text-red-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Founding Leader capabilities not included</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-xmark text-red-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Limited visibility and positioning</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-xmark text-red-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Cannot create AI Mentors</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-xmark text-red-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Limited course creation options</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-xmark text-red-400 text-xl mt-1"></i>
                  <span className="text-gray-600">Recurring monthly payment required</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                <p className="text-4xl font-bold text-gray-900 mb-2">$99+</p>
                <p className="text-gray-600 font-medium">Per month • Ongoing cost</p>
              </div>
            </div>
          </div>
          <div className="mt-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-center text-white">
            <p className="text-2xl font-bold">
              <i className="fa-solid fa-calculator mr-3"></i>
              In one year, the monthly plan can cost more than the Founding Leader lifetime deal — while still not
              including everything.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Claim Your Founding Leader Lifetime Access
            </h2>
            <p className="text-xl text-gray-600">Join the inner circle and unlock everything — for life</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-12 border-2 border-brand-200">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide mb-6">
                <i className="fa-solid fa-crown mr-2"></i>
                Founding Leader Lifetime Deal
              </div>
              <div className="mb-6">
                <p className="text-6xl font-bold text-gray-900 mb-2">$997</p>
                <p className="text-xl text-gray-600">Lifetime Access</p>
              </div>
              <div className="text-gray-600 mb-8">
                <p className="font-semibold">or 3 payments of $397</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-gray-50 rounded-2xl p-8 mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6">What's included:</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Everything unlocked</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Full creator access</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Visibility and credibility positioning</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">
                    Built-in monetization paths through courses, offers, events, and mentors
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-circle-check text-brand-600 text-xl mt-1"></i>
                  <span className="text-gray-800 font-medium">Lifetime value with one-time investment</span>
                </div>
              </div>
            </div>
            <div className="text-center mb-8">
              <a
                href="#apply"
                className="inline-block bg-gradient-to-r from-brand-500 to-brand-600 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition transform hover:scale-105"
              >
                Claim a Founding Leader Spot
              </a>
              <p className="text-sm text-gray-500 italic mt-4">Available until X spots are filled.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <p className="text-gray-700 text-center">
                <i className="fa-solid fa-shield-check text-brand-500 mr-2"></i>
                <span className="font-semibold">Optional guarantee or risk-reversal copy goes here (placeholder)</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about becoming a Founding Leader</p>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What is a Founding Leader?</h3>
              <p className="text-gray-700 leading-relaxed">
                A Founding Leader is a lifetime member with full creator permissions and the ability to contribute
                expertise through groups, events, content, courses, offers, and AI Mentors.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Is this available later?</h3>
              <p className="text-gray-700 leading-relaxed">
                Founding Leader spots are limited to X and available until filled. Once filled, new leaders can join
                through monthly membership options with fewer features and benefits.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                What makes this different from a regular membership?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Founding Leaders receive lifetime access with full creation capabilities, maximum visibility, and the
                ability to monetize their expertise through multiple channels. Regular members have access to content
                and community but limited creation permissions and visibility.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Can I create and sell my own courses?</h3>
              <p className="text-gray-700 leading-relaxed">
                Yes! Founding Leaders can create both free lead generation courses and paid premium courses. You keep
                the revenue from your paid courses while building your authority and audience within the community.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">How do AI Mentors work?</h3>
              <p className="text-gray-700 leading-relaxed">
                AI Mentors are focused chat experiences you can create based on your expertise. Members interact with
                your mentor to receive personalized guidance 24/7, allowing you to scale your impact without 1:1 time
                commitments.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                What if I'm not ready to create content right away?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                That's perfectly fine! Your Founding Leader access is lifetime, so you can start by participating in
                the community and create content when you're ready. There's no pressure or timeline.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Can I promote my existing services and programs?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Absolutely! Founding Leaders can feature their coaching, services, programs, and other offers in the
                community marketplace. This gives you visibility with a warm, aligned audience without feeling salesy.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Is there a payment plan available?</h3>
              <p className="text-gray-700 leading-relaxed">
                Yes! You can pay $997 one-time or split it into 3 payments of $397. Both options give you immediate
                lifetime access to all Founding Leader features.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="final-cta" className="py-24 px-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">Ready to Become a Founding Leader?</h2>
          <p className="text-xl lg:text-2xl mb-12 leading-relaxed opacity-95">
            Join the limited group of experts shaping this community from the beginning — with lifetime access, full
            creator permissions, and built-in ways to share your expertise and grow your impact.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold mb-2">$997</div>
                <p className="text-white/90">One-time lifetime investment</p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">X</div>
                <p className="text-white/90">Limited spots available</p>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">∞</div>
                <p className="text-white/90">Lifetime access & value</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <a
              href="#apply"
              className="inline-block bg-white text-brand-600 px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition transform hover:scale-105"
            >
              Claim Your Founding Leader Spot Now
            </a>
            <p className="text-white/80">
              <i className="fa-solid fa-clock mr-2"></i>
              Available until X spots are filled — don't miss this opportunity
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
