/**
 * PaginationQueryDto
 * Base query DTO for pagination that can be extended by modules
 */

import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NUMBER,
} from "../../constants/commons";

export class PaginationQueryDto {
  page: number = DEFAULT_PAGE_NUMBER;
  limit: number = DEFAULT_PAGE_SIZE;

  constructor(page?: number, limit?: number) {
    if (page !== undefined) {
      this.page = page;
    }
    if (limit !== undefined) {
      this.limit = limit;
    }
  }

  /**
   * Calculate offset from page and limit
   */
  getOffset(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Validate and normalize pagination params
   */
  normalize(): { page: number; limit: number; offset: number } {
    const page = Math.max(1, this.page);
    const limit = Math.max(1, Math.min(this.limit, 100));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }
}
