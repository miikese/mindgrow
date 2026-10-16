export type ExamQuestion={id:string;prompt:string;code?:string;options:string[]};
export type PracticalTask={id:string;title:string;prompt:string;rubric:string[]};
export type ExamData={profile:string;learner:string;track:string;version:number;questions:ExamQuestion[];tasks:PracticalTask[];answers?:Record<string,number>;practical?:Record<string,string>;score?:number;correct?:number;total?:number;submitted?:string;feedback?:string;certificateReference?:string;reviewedBy?:string;reviewedAt?:string};
export const PASS_MARK=85;
export const MIN_PRACTICAL_LENGTH=180;
