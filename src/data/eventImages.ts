/**
 * Local event artwork only. Each entry must use a literal `require()` so Metro
 * bundles it for offline use. Do not derive asset paths from catalog JSON.
 *
 * Add an entry only after recording the source, required attribution, and
 * permission or license basis below. Every candidate in PENDING_EVENT_ARTWORK
 * still has unverified reuse permission, so EVENT_IMAGES is intentionally
 * empty and every catalog event uses EventArtwork's designed fallback.
 * See docs/event-artwork-permissions.md for the clearance procedure.
 */
export interface EventImageAsset {
  /** Literal Metro asset module returned by `require()`. */
  source: number
  /** Intrinsic width / height; drives the cover-vs-contain decision. */
  aspect: number
  sourceUrl: string
  attribution: string
  permissionOrLicense: string
}

export const EVENT_IMAGES: Readonly<Record<string, EventImageAsset | undefined>> = {}

/**
 * Cleared-to-bundle candidates from the 2026-10-12 artwork package. Data only —
 * no `require()` here, so nothing enters the distributable bundle until an
 * entry is promoted into EVENT_IMAGES with a recorded permission basis.
 *
 * Recurring series share one file (identical SHA-256); every occurrence keeps
 * its own mapping. When promoting: copy each unique `file` once into
 * assets/event-artwork/, add one literal require per unique file, and point
 * every listed eventId at it.
 */
export interface PendingEventArtwork {
  /** Basename within the source package, e.g. `candidates/warsaw-demo-day-2026-10-13.png`. */
  file: string
  sha256: string
  width: number
  height: number
  sourcePage: string
}

const TORONTO_VIBESTATION_FILE = 'candidates/toronto-vibestation.jpg'
const MONTREAL_VIBESTATION_FILE = 'candidates/montreal-vibestation.jpg'
const VANCOUVER_VIBESTATION_FILE = 'candidates/vancouver-vibestation.jpg'

export const PENDING_EVENT_ARTWORK: Readonly<Record<string, PendingEventArtwork>> = {
  'breakpoint-2026': {
    file: 'candidates/breakpoint-2026.jpg',
    sha256: '3d3f364b5c5cea1eba61c550e773271b36a6ba996187a65fedc0fccd108e9b33',
    width: 1200,
    height: 630,
    sourcePage: 'https://solana.com/breakpoint',
  },
  'hacker-house-london-2026': {
    file: 'candidates/hacker-house-london-2026.jpg',
    sha256: 'ff41728e8d9be4544e3b4c5dfdbcec357b269a92748bf488027fb2aeb2b96e4b',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/london-hh-26',
  },
  'solana-intelligence-summit-2026': {
    file: 'candidates/solana-intelligence-summit-2026.jpg',
    sha256: '06443fe342a9cdd583d206ff25c73df8a99eecb46d69718ba7394add55dc9db2',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/intelligence-summit',
  },
  'solana-summit-india-2026': {
    file: 'candidates/solana-summit-india-2026.png',
    sha256: 'e53610ea6c74a03548d14398a9f8aa59acd07c12ae36f24858c6a07c67403b9b',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/solana-summit-india',
  },
  'islanddao-v5': {
    file: 'candidates/islanddao-v5.jpg',
    sha256: 'a332d87b424e55d8a73f9ad41ec75c76efb625fce3248ee98ba5b20e47749463',
    width: 400,
    height: 400,
    sourcePage: 'https://luma.com/6laijuyn',
  },
  'solana-startup-connect-gh-2026': {
    file: 'candidates/solana-startup-connect-gh-2026.jpg',
    sha256: 'aba5af02777e9471fb9af25d13d9b9c921d9bc7bbf75424751a54cb6495e7216',
    width: 572,
    height: 1024,
    sourcePage: 'https://luma.com/nx9ps6ud',
  },
  'bfb-office-hours-joe-takayama-2026-10-12': {
    file: 'candidates/bfb-office-hours-joe-takayama-2026-10-12.jpg',
    sha256: '23e4ef02ae826107680436cd4fee54714c709a8d755015e60428ec9598ec474c',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/build-for-breakpoint-office-hours-with-joe',
  },
  'warsaw-demo-day-2026-10-13': {
    file: 'candidates/warsaw-demo-day-2026-10-13.png',
    sha256: '3d6467bd41b687f8b1a2d1f2f11b8ee51cee9cf76a999b421c0b646946db54a8',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/stpldemoday',
  },
  'london-demo-dinner-2026-10-13': {
    file: 'candidates/london-demo-dinner-2026-10-13.jpg',
    sha256: '63659fa74893782b92e66fd317fab63eba2b02ef745c6b99540c4238de290e1f',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/London-DemoDinner-2026',
  },
  'superteam-member-office-hours-2026-10-14': {
    file: 'candidates/superteam-member-office-hours-2026-10-14.png',
    sha256: 'cb65b338612e0ce5bad4451331f79d03853ab3d94fee3448ecd63c90fe83759b',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/member-office-hours',
  },
  'canada-demo-day-watch-party-2026-10-14': {
    file: 'candidates/canada-demo-day-watch-party-2026-10-14.png',
    sha256: 'bd965d059f3200f61515be6ccd762cc57685970da27b4fb8c72b7eba52e5ae99',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/superteam-lbhe',
  },
  'bfb-how-to-product-test-2026-10-15': {
    file: 'candidates/bfb-how-to-product-test-2026-10-15.jpg',
    sha256: '01b5dfb6b827f0c70730e9f168c534b081269938316558fd7767eed78e64d5e9',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/build-for-breakpoint-the-smallest-test',
  },
  'stablecoin-connect-dubai-2026-10-15': {
    file: 'candidates/stablecoin-connect-dubai-2026-10-15.jpg',
    sha256: '0e7b16b7920e97bb2c6e6d472eb3334573f6d47c0ef7ab804b40ea646e4b6099',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/StablecoinConnectSolanaAquanowUniversal',
  },
  'berlin-founders-funders-dinner-2026-10-15': {
    file: 'candidates/berlin-founders-funders-dinner-2026-10-15.jpg',
    sha256: 'd33d2ae8bd9ab054bcb668aa74df010f916293b91987e5dbf4f2d82d8dfc59cc',
    width: 600,
    height: 600,
    sourcePage: 'https://luma.com/demodinner',
  },
  'coworking-fridays-berlin-2026-10-16': {
    file: 'candidates/coworking-fridays-berlin-2026-10-16.jpg',
    sha256: '9466c13f19d278a0eb72f6c23402e0e7158ccd287e8affecae16d85f7c9dc81d',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/n1nuqd8c',
  },
  'coworking-fridays-london-2026-10-16': {
    file: 'candidates/coworking-fridays-london-2026-10-16.png',
    sha256: '406313e9ae846bf69de9ddfe06b9b3a9be77e2282dd965fc4b1b5f84538a1f7a',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/london-oct-16',
  },
  'toronto-vibestation-2026-10-16': {
    file: TORONTO_VIBESTATION_FILE,
    sha256: '6cec89c4cb4cfe0e07c62ddcb5b28d5a266bd8780ac0249dad6c645e909437b6',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/ka6rityl',
  },
  'montreal-vibestation-2026-10-16': {
    file: MONTREAL_VIBESTATION_FILE,
    sha256: '103da847a1dbf3934f594b0fb7045162cd3d2c8b01a80067f289c6d070b33f2c',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/r40yqddb',
  },
  'vancouver-vibestation-2026-10-16': {
    file: VANCOUVER_VIBESTATION_FILE,
    sha256: '14d386a96e15e6f783350a522fc7ab6e7ab2fb6b0afb5ba0367f353e9e137a03',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/fetmgtrz',
  },
  'bfb-security-and-audits-2026-10-16': {
    file: 'candidates/bfb-security-and-audits-2026-10-16.jpg',
    sha256: '78c96f394b139d45c097aeef0a7ef8cb290e4bdf71356c5358758f2b24a7c20f',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/build-for-breakpoint-security-and-audits',
  },
  'superteam-india-poker-night-2026-10-17': {
    file: 'candidates/superteam-india-poker-night-2026-10-17.jpg',
    sha256: 'b33a07589ea25da1209823c5f7b1e3807684c65cd6fb422a635e029c925c0753',
    width: 1000,
    height: 1000,
    sourcePage: 'https://luma.com/stin-pokernight',
  },
  'whats-next-after-colosseum-2026-10-19': {
    file: 'candidates/whats-next-after-colosseum-2026-10-19.jpg',
    sha256: '401ce28b2b9fd6975213198408efd00581b8e0853d4cbede9b117820abbd2323',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/superteam-0tbb',
  },
  'harmonia-frankfurt-2026-10-19': {
    file: 'candidates/harmonia-frankfurt-2026-10-19.png',
    sha256: 'd4142a060dcf6634c95dc1852fd015557c9dc031ef20132955402fee0537313d',
    width: 840,
    height: 840,
    sourcePage: 'https://luma.com/Harmonia-Frankfurt',
  },
  'solana-huma-happy-hour-2026-10-20': {
    file: 'candidates/solana-huma-happy-hour-2026-10-20.jpg',
    sha256: '7ccd1a7a841561404c71da9999fca2625490b46acbabbd5c6aa86c4699667f71',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/solana-huma-happy-hour',
  },
  'rust-melbourne-meetup-2026-10-22': {
    file: 'candidates/rust-melbourne-meetup-2026-10-22.jpg',
    sha256: 'ac5f3448a31a47d28e3bfe80e40e2c2368f42bd852c6e018491764873e5ffd1e',
    width: 1023,
    height: 1023,
    sourcePage: 'https://luma.com/fdvdqkq9',
  },
  'toronto-vibestation-2026-10-23': {
    file: TORONTO_VIBESTATION_FILE,
    sha256: '6cec89c4cb4cfe0e07c62ddcb5b28d5a266bd8780ac0249dad6c645e909437b6',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/vi07rwlu',
  },
  'montreal-vibestation-2026-10-23': {
    file: MONTREAL_VIBESTATION_FILE,
    sha256: '103da847a1dbf3934f594b0fb7045162cd3d2c8b01a80067f289c6d070b33f2c',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/izc6bvfp',
  },
  'vancouver-vibestation-2026-10-23': {
    file: VANCOUVER_VIBESTATION_FILE,
    sha256: '14d386a96e15e6f783350a522fc7ab6e7ab2fb6b0afb5ba0367f353e9e137a03',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/ydg8swsd',
  },
  'el-encuentro-2026-10-26': {
    file: 'candidates/el-encuentro-2026-10-26.jpg',
    sha256: '373c33f3276834032849cc5c4af1b018b9e1f51115fda53e5ac8a0ee4a94af72',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/66thrqij',
  },
  'ecosystem-call-october-2026': {
    file: 'candidates/ecosystem-call-october-2026.png',
    sha256: 'a4234c8e0e75f23385c4a3f2bb363f2298070366ee9f340155cccac68c9628f1',
    width: 1200,
    height: 1199,
    sourcePage: 'https://luma.com/0j8gx7i1',
  },
  'toronto-vibestation-2026-10-30': {
    file: TORONTO_VIBESTATION_FILE,
    sha256: '6cec89c4cb4cfe0e07c62ddcb5b28d5a266bd8780ac0249dad6c645e909437b6',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/mspwm8hn',
  },
  'montreal-vibestation-2026-10-30': {
    file: MONTREAL_VIBESTATION_FILE,
    sha256: '103da847a1dbf3934f594b0fb7045162cd3d2c8b01a80067f289c6d070b33f2c',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/auj78wwi',
  },
  'vancouver-vibestation-2026-10-30': {
    file: VANCOUVER_VIBESTATION_FILE,
    sha256: '14d386a96e15e6f783350a522fc7ab6e7ab2fb6b0afb5ba0367f353e9e137a03',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/7kc2frg9',
  },
  'toronto-vibestation-2026-11-06': {
    file: TORONTO_VIBESTATION_FILE,
    sha256: '6cec89c4cb4cfe0e07c62ddcb5b28d5a266bd8780ac0249dad6c645e909437b6',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/axcqt5r3',
  },
  'montreal-vibestation-2026-11-06': {
    file: MONTREAL_VIBESTATION_FILE,
    sha256: '103da847a1dbf3934f594b0fb7045162cd3d2c8b01a80067f289c6d070b33f2c',
    width: 800,
    height: 800,
    sourcePage: 'https://luma.com/8mzapssx',
  },
  'solana-demo-day-london-2026-11-12': {
    file: 'candidates/solana-demo-day-london-2026-11-12.png',
    sha256: '64c203b927fd2246eaedb3fa17c4d6a0b227e7adb1081eead5f9d2f54c72f276',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/sol-demo-day',
  },
  'jito-200ms-2026-11-13': {
    file: 'candidates/jito-200ms-2026-11-13.png',
    sha256: 'e93ac7c4f179abdba1767ea882cbf0045b0b7573ed4474c70cad45f92f4edcef',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/6xip72je',
  },
  'purple-table-2026-11-13': {
    file: 'candidates/purple-table-2026-11-13.jpg',
    sha256: 'd884ac72bfb0ac471be19d00031a4ef91ab6942591aad3d780732fc9851292df',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/rszxbf8n',
  },
  'crew-445-community-run-2026-11-14': {
    file: 'candidates/crew-445-community-run-2026-11-14.jpg',
    sha256: '5a947e8afddb205b7c84917b09bf832ed5e8f824a4caf86a7cf9c160f62d7691',
    width: 970,
    height: 1600,
    sourcePage: 'https://luma.com/n6r4k7vb',
  },
  'scale-or-die-london-2026-11-14': {
    file: 'candidates/scale-or-die-london-2026-11-14.jpg',
    sha256: '2c2ae91301b4a376ee536cec0cc592afeccc06b5de03fddd4389f8dc5dbe10b1',
    width: 1200,
    height: 1206,
    sourcePage: 'https://luma.com/scale-or-die-26',
  },
  'solana-cup-breakpoint-2026-11-14': {
    file: 'candidates/solana-cup-breakpoint-2026-11-14.jpg',
    sha256: 'a27fb9b9af393cb1f5226634bbe9f69a63193f4719a1c49c0ef1cdaaafa438c5',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/5sf70a63',
  },
  'founder-vc-summit-demo-day-2026-11-14': {
    file: 'candidates/founder-vc-summit-demo-day-2026-11-14.jpg',
    sha256: '4980165bcdaa579edc45c9d23a79f915edac11fb5d3a25101e29bb6a51c8633d',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/a4qnux81',
  },
  'tilt-pay-morning-coffee-2026-11-15': {
    file: 'candidates/tilt-pay-morning-coffee-2026-11-15.png',
    sha256: 'ab114fcdf09ee7e3215c91cf25b7134f63e76afde2ce96febb9582cadf9bfac4',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/kk8dr4ty',
  },
  'blockzero-2026-11-15': {
    file: 'candidates/blockzero-2026-11-15.png',
    sha256: 'b1ab440589c9e88d4ba279649f2c1dfc4ae91e7e9917379e03004078d192c6c5',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/dmxdc394',
  },
  'breakpoint-trading-battle-2026-11-15': {
    file: 'candidates/breakpoint-trading-battle-2026-11-15.jpg',
    sha256: 'a9c6c2ded7864f5f2ab702fe677304175e328d5349189b9b9a55bd3db88b1d76',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/h6w8v75y',
  },
  'founder-vc-summit-vip-dinner-2026-11-15': {
    file: 'candidates/founder-vc-summit-vip-dinner-2026-11-15.jpg',
    sha256: '8e3e9733a89c77e1cee5d246429d405173b94406bad02077b640cd29141865be',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/hrb0040d',
  },
  'altitude-rain-evening-2026-11-16': {
    file: 'candidates/altitude-rain-evening-2026-11-16.jpg',
    sha256: 'd780bd51b9b8ecc917d806745b27d563fbc951cbe03c0115c0fdb02a2b34700f',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/altitude-rain-BP26',
  },
  'money-layer-breakpoint-week-2026-11-16': {
    file: 'candidates/money-layer-breakpoint-week-2026-11-16.jpg',
    sha256: '31a7f7a2c257b5aae9b8a756369a5d785a4ec3cc564e6070c7d57cda970bb680',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/xykfcf1a',
  },
  'prime-london-web3-finance-dinner-2026-11-16': {
    file: 'candidates/prime-london-web3-finance-dinner-2026-11-16.jpg',
    sha256: '63c9066cf01600bd88bde73e67853d418ff2bf82ef5e3a68625bfc77d16d3b62',
    width: 1080,
    height: 1080,
    sourcePage: 'https://luma.com/aqntywn2',
  },
  'beyond-the-frame-2026-11-16': {
    file: 'candidates/beyond-the-frame-2026-11-16.jpg',
    sha256: '128d0efcfb8a7c9d9840901520e3823c8f23ca533d1a75215a203c0d2bdc8c72',
    width: 1200,
    height: 1200,
    sourcePage: 'https://luma.com/frzpha3k',
  },
  'new-friendship-tech-london-2026-11-16': {
    file: 'candidates/new-friendship-tech-london-2026-11-16.jpg',
    sha256: 'dc6afbf1acd28e8cf78cfa02693daec83185ff5908de34f7bf176e4e2ea4595f',
    width: 864,
    height: 864,
    sourcePage: 'https://luma.com/yrxbkvmn',
  },
}

export function getPendingEventArtwork(eventId: string): PendingEventArtwork | undefined {
  return PENDING_EVENT_ARTWORK[eventId]
}

/**
 * Cover only when the intrinsic aspect is close to the box aspect, so crops
 * never cut essential poster text; otherwise contain the full artwork.
 */
export function preferredContentFit(imageAspect: number, containerAspect: number): 'cover' | 'contain' {
  const ratio = imageAspect / containerAspect
  return ratio >= 0.9 && ratio <= 1.1 ? 'cover' : 'contain'
}

export function getEventImage(eventId: string): EventImageAsset | undefined {
  return EVENT_IMAGES[eventId]
}

/** Keeps view state separate from catalog lookup so a failed load never hides its fallback. */
export function shouldRenderEventImage(
  image: EventImageAsset | undefined,
  loadFailed: boolean,
): image is EventImageAsset {
  return image !== undefined && !loadFailed
}
