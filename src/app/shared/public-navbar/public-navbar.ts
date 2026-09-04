import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-navbar.html',
  styleUrls: ['./public-navbar.scss']
})
export class PublicNavbar {
  private router = inject(Router);

  showBackToTop = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Exibe o botão após o usuário descer mais de 300px
    this.showBackToTop = window.scrollY > 300;
  }

  navigateToSection(sectionId: string): void {
    const isRoot = this.router.url === '/' || this.router.url.startsWith('/#');

    if (isRoot) {
      this.scrollToElement(sectionId);
    } else {
      this.router.navigate(['/'], { fragment: sectionId }).then(() => {
        setTimeout(() => {
          this.scrollToElement(sectionId);
        }, 100);
      });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}