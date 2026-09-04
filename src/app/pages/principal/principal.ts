import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicNavbar } from '../../shared/public-navbar/public-navbar';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicNavbar],
  templateUrl: './principal.html',
  styleUrls: ['./principal.scss']
})
export class Principal {
  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}