// Initial practice checks for the two existing video topics. Never replace an
// educator's questions. Administrators can review and edit them with each video.
export const initialLessonChecks=[
  {classLevel:'S1',subject:'physics',topic:'heattransfer',questions:[
    {question:'A metal spoon becomes hot when one end is placed in hot water. How does heat travel along the spoon?',options:['Conduction','Convection','Radiation only','Evaporation'],answer:0,explanation:'Conduction transfers thermal energy through the metal from the hotter end to the cooler end. The material does not move as a whole.'},
    {question:'Why does warmer water rise while cooler water sinks in a container heated from below?',options:['Warm water always has more mass','Heat cannot move through water','Warmer water expands and becomes less dense','Cooler water becomes a gas'],answer:2,explanation:'Heating makes the water expand and become less dense, so it rises. Cooler, denser water sinks to replace it. This circulation transfers heat by convection.'},
    {question:'Which process allows energy from the Sun to reach Earth through space?',options:['Conduction through air','Radiation','Convection through empty space','Condensation'],answer:1,explanation:'Radiation transfers energy by electromagnetic waves and does not require a material medium. Conduction and convection require matter.'},
    {question:'Why is a wooden handle useful on a hot cooking pot?',options:['Wood makes the pot colder instantly','Wood stops all radiation','Wood is a very good conductor','Wood is a poor conductor of heat'],answer:3,explanation:'Wood conducts heat much less readily than metal. A wooden handle slows conduction to the hand, although it can still become hot and should be handled carefully.'},
  ]},
  {classLevel:'P6',subject:'science',topic:'bloodcirculation',questions:[
    {question:'Which organ pumps blood around the body?',options:['The stomach','The heart','The kidney','The brain'],answer:1,explanation:'The heart is a muscular pump. Its contractions push blood through blood vessels to the lungs and the rest of the body.'},
    {question:'What happens to blood as it passes through the lungs?',options:['It picks up oxygen and releases carbon dioxide','It turns into air','It stops flowing permanently','It loses all its water'],answer:0,explanation:'In the lungs, oxygen moves into the blood and carbon dioxide moves out of the blood to be breathed out. The blood returns to the heart before being pumped to the body.'},
    {question:'Which blood cells mainly carry oxygen around the body?',options:['White blood cells','Platelets','Red blood cells','Nerve cells'],answer:2,explanation:'Red blood cells contain haemoglobin, which carries oxygen. White blood cells help defend the body, while platelets help blood clot.'},
    {question:'What name is given to blood vessels that carry blood away from the heart?',options:['Veins','Nerves','Air passages','Arteries'],answer:3,explanation:'Arteries carry blood away from the heart. Veins carry blood towards the heart. These names describe the direction of flow, rather than whether the blood contains much oxygen.'},
  ]},
];
export async function addInitialLessonChecks(db){
  await db.batch(initialLessonChecks.map(q=>db.prepare(`UPDATE content SET data=json_set(data,'$.questions',json(?)),updated_at=? WHERE kind='lesson' AND status='published' AND json_extract(data,'$.classLevel')=? AND lower(json_extract(data,'$.subject'))=? AND lower(replace(json_extract(data,'$.topic'),' ',''))=? AND COALESCE(json_array_length(data,'$.questions'),0)=0`).bind(JSON.stringify(q.questions),new Date().toISOString(),q.classLevel,q.subject,q.topic)));
}
