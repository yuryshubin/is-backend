export interface PagingResult<T> {
   currentPage: number;
   totalPages: number;
   items: T[];
}
