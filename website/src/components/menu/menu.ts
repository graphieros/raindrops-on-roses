import type { MenuItem } from './menu.types'

export const menuItems: MenuItem[] = [
  {
    label: 'Contributing',
    to: '/contributing',
    color: 'text-rose hover:text-rose',
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
      },
      {
        label: 'lttb',
        to: '/number/lttb',
      },
      {
        label: 'niceNumber',
        to: '/number/nice-number',
      },
      {
        label: 'numbersFromSeed',
        to: '/number/numbers-from-seed',
      },
    ],
  },
]
