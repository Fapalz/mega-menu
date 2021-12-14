import '../build/index.css'
import '../build/theme.css'

import MegaMenu from '../build/index.esm.browser'

// eslint-disable-next-line no-new
const MegaMenuInstance = new MegaMenu('.c-mega-menu', {
  init: (menu) => {
    console.log(menu, 'init')
  },
  openTransitionStart: (menu, item) => {
    console.log(menu, item, 'start')
  },
  openTransitionEnd: (menu, item) => {
    console.log(menu, item, 'end')
  },
  closeTransitionStart: (menu, item) => {
    console.log(menu, item, 'start')
  },
  closeTransitionEnd: (menu, item) => {
    console.log(menu, item, 'end')
  },
  beforeDestroy: (menu) => {
    console.log(menu, 'befiore')
  },
  destroy: (menu) => {
    console.log(menu, 'destroy')
  },
})

setTimeout(() => {
  MegaMenuInstance.destroy()
}, 2000)
