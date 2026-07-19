import { supabase } from './supabase'
export async function requestSession(learnerId, teacherId, skillName) {
const COST = 5 

const { data: learner } = await supabase
.from('profiles').select('credits').eq('id', learnerId).single()

if (learner.credits < COST) return { error: 'Not enough credits' }

const { data: session, error } = await supabase.from('sessions').insert({
teacher_id: teacherId, learner_id: learnerId,
skill_name: skillName, credits_used: COST, status: 'pending'
}).select().single()

if (error) return { error: error.message }
return { session }
}

export async function completeSession(sessionId, teacherId) {
const { data: session } = await supabase
.from('sessions').select('*').eq('id', sessionId).single()

if (session.teacher_id !== teacherId) return { error: 'Not authorised' }

await supabase.from('sessions')
.update({ status: 'completed' }).eq('id', sessionId)
await supabase.rpc('decrement_credits', { uid: session.learner_id, amount: session.credits_used })
await supabase.rpc('increment_credits', { uid: session.teacher_id, amount: session.credits_used })

await supabase.from('credit_transactions').insert([
{ user_id: session.learner_id, amount: -session.credits_used,
type: 'spent', session_id: sessionId,
description: `Learned ${session.skill_name}` },
{ user_id: session.teacher_id, amount: session.credits_used,
type: 'earned', session_id: sessionId,
description: `Taught ${session.skill_name}` },
])

return { success: true }
}