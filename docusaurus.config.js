const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Develop your first DApp',
  tagline: 'Develop your first DApp on CKB layer1',
  url: 'https://zengbing15.github.io',
  baseUrl: '/implement-dapp-docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'zengbing15', // Usually your GitHub org/user name.
  projectName: 'implement-dapp-docs', // Usually your repo name.
  plugins: ['docusaurus-plugin-sass'],
  themeConfig: {
    algolia: {
      apiKey: 'b265f8b6d52283b021d56b5e88de1c2e',
      indexName: 'implement-dapp-doc',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: see doc section below
      //appId: 'YOUR_APP_ID',

      // Optional: Algolia search parameters
      searchParameters: {},

      //... other Algolia params
    },
    navbar: {
      title: 'Develop your first DApp',
      logo: {
        alt: 'My Site Logo',
        src: 'img/favicon.png',
      },
      items: [
        /*
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Tutorial',
        },
        */
       
        /* {to: '/blog', label: 'Blog', position: 'left'},*/
        {
          label: 'GitHub',
          href: 'https://github.com/zengbing15/implement-dapp-docs',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Github',
              /*to: '/docs/intro',*/
              href: 'https://github.com/zengbing15/implement-dapp-docs',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.com/invite/AqGTUE9',
            },
            {
              label: 'Nervos Talk',
              href: 'https://talk.nervos.org/',
            },
          ],
        },
        {
          title: 'More',
          
          items: [
            /*
            {
              label: 'Blog',
              to: '/blog',
            },
            */
            
            {
              label: 'Lumos-doc',
              href: 'https://cryptape.github.io/lumos-doc/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} zengbing. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
          routeBasePath: '/'
        },
        /*
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/main/website/blog/',
        },
        */
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
