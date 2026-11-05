// Subject menus from NCDC's secondary curriculum directory and 2025 A-Level syllabi.
// https://ncdc.go.ug/directorates/ · https://ncdc.go.ug/books/?wbg_category_s=A-LEVEL+CURRICULUM+2025
export const LOCAL_LANGUAGES = ['Ateso','Dhopadhola','Leb Acoli','Leblango','Luganda','Lugbarati','Lumasaaba','Lusoga','Runyankore-Rukiga','Runyoro-Rutooro'] as const;
export const O_LEVEL_CORE = ['English Language','Mathematics','History and Political Education','Geography','Physics','Biology','Chemistry'] as const;
export const O_LEVEL_SUBJECTS = [...O_LEVEL_CORE,'Physical Education','Christian Religious Education (CRE)','Islamic Religious Education (IRE)','Entrepreneurship','Kiswahili','Agriculture','Information and Communication Technology (ICT)','Literature in English','Art and Design','Performing Arts','Technology and Design','Nutrition and Food Technology','General Science','Arabic','Chinese','French','German','Latin',...LOCAL_LANGUAGES] as const;
export const A_LEVEL_SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','Economics','History','Geography','Literature in English','Christian Religious Education (CRE)','Islamic Religious Education (IRE)','Entrepreneurship Education','Agriculture','Art and Design','Clothing and Textiles','Foods and Nutrition','Music','Physical Education','Principal ICT','Technical Drawing','Metalwork','Woodwork','Arabic','Chinese','French','German','Kiswahili','Latin',...LOCAL_LANGUAGES,'General Paper','Subsidiary Mathematics','Subsidiary ICT'] as const;
export function secondarySubjects(classLevel='all'):readonly string[] {
  if(['S5','S6'].includes(classLevel))return A_LEVEL_SUBJECTS;
  if(['S1','S2','S3','S4'].includes(classLevel))return O_LEVEL_SUBJECTS;
  return [...new Set([...O_LEVEL_SUBJECTS,...A_LEVEL_SUBJECTS])];
}
export function subjectName(subject:string,classLevel='') {
  if(['Sub Mathematics','Sub. Mathematics','Subsidiary Maths'].includes(subject))return 'Subsidiary Mathematics';
  if(classLevel.startsWith('S')&&subject==='English')return 'English Language';
  return subject;
}
export function subjectGroup(subject:string,classLevel:string) {
  if(['S5','S6'].includes(classLevel))return ['General Paper','Subsidiary Mathematics','Subsidiary ICT'].includes(subject)?'General / subsidiary':'Principal subject';
  if((O_LEVEL_CORE as readonly string[]).includes(subject))return 'Core subject';
  if(['S1','S2'].includes(classLevel)&&['Physical Education','Entrepreneurship','Kiswahili'].includes(subject))return 'Core in S.1–S.2';
  if(['S1','S2'].includes(classLevel)&&subject.includes('Religious Education'))return 'Religious education choice';
  return 'Optional / school offering';
}
