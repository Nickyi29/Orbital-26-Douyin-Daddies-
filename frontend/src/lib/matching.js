export function calculateMatchScore(
  myProfile, mySkills,
  candidate, candidateSkills
) {
  const myWants      = mySkills
    .filter(s => s.type === 'learning').map(s => s.name)
  const myOffers     = mySkills
    .filter(s => s.type === 'offering').map(s => s.name)
  const theirOffers  = candidateSkills
    .filter(s => s.type === 'offering').map(s => s.name)
  const theirWants   = candidateSkills
    .filter(s => s.type === 'learning').map(s => s.name)

  const theyCanTeachMe = myWants
    .filter(s => theirOffers.includes(s))

  const iCanTeachThem = myOffers
    .filter(s => theirWants.includes(s))

  if (theyCanTeachMe.length === 0 && iCanTeachThem.length === 0) {
    return null   
  }

  const totalMatches = theyCanTeachMe.length + iCanTeachThem.length
  const maxPossible  = myWants.length + myOffers.length
  const skillScore   = maxPossible > 0
    ? (totalMatches / maxPossible) * 50 : 0

  const myWantCategories     = mySkills
    .filter(s => s.type === 'learning').map(s => s.category)
  const theirOfferCategories = candidateSkills
    .filter(s => s.type === 'offering').map(s => s.category)
  const categoryOverlap      = myWantCategories
    .filter(c => theirOfferCategories.includes(c)).length
  const categoryScore        = myWantCategories.length > 0
    ? (categoryOverlap / myWantCategories.length) * 20 : 0

  const rating      = candidate.rating ?? 3.0
  const ratingScore = (rating / 5) * 20

  let completenessScore = 0
  if (candidate.bio)              completenessScore += 4
  if (candidate.telegram_handle)  completenessScore += 3
  if (candidate.course)           completenessScore += 3

  const total = Math.round(
    skillScore + categoryScore + ratingScore + completenessScore
  )

  return {
    total,
    breakdown: {
      skill:        Math.round(skillScore),
      category:     Math.round(categoryScore),
      rating:       Math.round(ratingScore),
      completeness: Math.round(completenessScore),
    },
    matchedSkills: {
      theyCanTeachMe,
      iCanTeachThem,
    }
  }
}