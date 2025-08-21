export type Category = 'To Do' | 'In Progress' | 'Review' | 'Completed';


export interface TaskItem {
id: string;
name: string;
category: Category;
start: string; 
end: string; 
}


export interface FiltersState {
categories: Category[]; 
weeks: 0 | 1 | 2 | 3; 
search: string;
}