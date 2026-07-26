export function calculateMatchScore(
  myProfile,
  mySkills,
  myAvailability,
  candidateProfile,
  candidateSkills,
  candidateAvailability
) {

  const myOffering = mySkills.filter(s => s.type === 'offering').map(s => s.name)
  const myLearning = mySkills.filter(s => s.type === 'learning').map(s => s.name)
  
  const candidateOffering = candidateSkills.filter(s => s.type === 'offering').map(s => s.name)
  const candidateLearning = candidateSkills.filter(s => s.type === 'learning').map(s => s.name)

  const theyCanTeachMe = candidateOffering.filter(s => myLearning.includes(s))
  const iCanTeachThem = myOffering.filter(s => candidateLearning.includes(s))

  const directMatchCount = theyCanTeachMe.length + iCanTeachThem.length
  const skillScore = Math.min(directMatchCount * 25, 50)


  const myCategories = new Set(mySkills.map(s => s.category))
  const candidateCategories = new Set(candidateSkills.map(s => s.category))
  const commonCategories = [...myCategories].filter(c => candidateCategories.has(c))
  const categoryScore = Math.min(commonCategories.length * 5, 10)

  const rating = candidateProfile.rating ?? 5.0
  const ratingScore = (rating / 5.0) * 10

  const mySlots = myAvailability?.slots || []
  const candidateSlots = candidateAvailability?.slots || []
  
  let availScore = 15 
  if (mySlots.length > 0 && candidateSlots.length > 0) {
    const overlap = mySlots.filter(s => candidateSlots.includes(s)).length
    availScore = Math.round((overlap / Math.max(mySlots.length, 1)) * 30)
  }

  const totalRaw = skillScore + categoryScore + ratingScore + availScore
  const total = Math.min(Math.round(totalRaw), 100)

  return {
    total,
    breakdown: {
      skill: skillScore,
      category: categoryScore,
      rating: Math.round(ratingScore),
      availability: Math.round(availScore)
    },
    matchedSkills: {
      theyCanTeachMe,
      iCanTeachThem
    }
  }
}