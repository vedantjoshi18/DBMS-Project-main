import { Pipe, PipeTransform } from '@angular/core';
import { Event } from '../models/event.model';

@Pipe({
  name: 'categoryFilter',
  standalone: true
})
export class CategoryFilterPipe implements PipeTransform {
  transform(events: Event[] | null, category: string): Event[] {
    if (!events || !category || category === 'All') return events || [];

    // Map broad categories (Frontend) to specific types (Backend)
    const categoryMap: { [key: string]: string[] } = {
      'Technology': ['Conference', 'Workshop', 'Technology'],
      'Music': ['Concert', 'Music'],
      'Business': ['Seminar', 'Meetup', 'Business'],
      'Sports': ['Sports'],
      'Art': ['Other', 'Art', 'Workshop'] // Mapping Art to Other/Workshop as per available types
    };

    // If category is in map, use mapped types. Otherwise, use exact match.
    const targetCategories = categoryMap[category];

    if (targetCategories) {
      return events.filter(event => targetCategories.includes(event.category));
    }

    return events.filter(event => event.category === category);
  }
}