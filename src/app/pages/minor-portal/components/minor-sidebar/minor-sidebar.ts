import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-minor-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './minor-sidebar.html',
  styleUrls: ['./minor-sidebar.scss']
})
export class MinorSidebar {
  @Input() level: number = 4;
  @Input() currentXp: number = 250;
  @Input() targetXp: number = 400;
  @Input() dailyQuote: { quote: string; author: string } = {
    quote: 'Disciplina hoje, liberdade amanhã!',
    author: 'Seu futuro herói'
  };

  get xpPercentage(): number {
    return Math.min(100, Math.round((this.currentXp / this.targetXp) * 100));
  }
}