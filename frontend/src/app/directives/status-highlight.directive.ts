import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appStatusHighlight]',
  standalone: true
})
export class StatusHighlightDirective implements OnChanges {
  @Input('appStatusHighlight') status = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    if (this.status === 'sold-out') {
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid red');
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0.7');
    } else if (this.status === 'open') {
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid green');
    }
  }
}