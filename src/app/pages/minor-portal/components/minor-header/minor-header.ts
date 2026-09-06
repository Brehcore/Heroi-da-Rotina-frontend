import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-minor-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './minor-header.html',
  styleUrls: ['./minor-header.scss']
})
export class MinorHeader {
  @Input() minorName: string = 'Campeão';
  @Input() minorProfileUrl: string | null = null;
  @Input() notificationCount: number = 3;

  @Output() logoutEvent = new EventEmitter<void>();

  onLogout(): void {
    this.logoutEvent.emit();
  }
}