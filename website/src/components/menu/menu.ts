import type { MenuItem } from './menu.types'

export const menuItems: MenuItem[] = [
  {
    label: 'Contributing',
    to: '/contributing',
    color: 'text-rose hover:text-rose',
    keywords: ['oss', 'open-source', 'github'],
  },
  {
    label: 'Getting started',
    children: [
      {
        label: 'Installation',
        to: '/installation',
      },
    ],
  },
  {
    label: 'number',
    children: [
      {
        label: 'clamp',
        to: '/number/clamp',
        keywords: ['min', 'max', 'minimum', 'maximum'],
      },
      {
        label: 'lttb',
        to: '/number/lttb',
        keywords: ['downsample', 'bucket', 'triangle', 'preserve'],
      },
      {
        label: 'niceNumber',
        to: '/number/nice-number',
        keywords: ['scale', 'tick', 'interval', 'progression'],
      },
      {
        label: 'numbersFromSeed',
        to: '/number/numbers-from-seed',
        keywords: ['seed', 'series', 'random', 'deterministic', 'generate'],
      },
    ],
  },
]
