// @mostajs/face — Menu contribution
// Author: Dr Hamid MADANI drmdh@msn.com
//
// @mostajs/face ne fournit PAS de pages dashboard propres.
// Il s'integre dans d'autres pages (reception, clients...).
// Ce fichier est present par convention avec une contribution vide.

import type { ModuleMenuContribution } from '@mostajs/menu'

export const faceMenuContribution: ModuleMenuContribution = {
  moduleKey: 'face',
  // Pas d'items ni de groups : ce module n'a pas de pages propres
}
