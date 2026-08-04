import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ConfigsService, ConfigMenu, ConfigSubItem } from './configs.service';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-configs',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './configs.html',
  styleUrls: ['./configs.scss']
})
export class Configs implements OnInit {
  private configsService = inject(ConfigsService);
  private router = inject(Router);

  menus: ConfigMenu[] = [];
  
  // Controle para o Accordion (Mobile)
  expandedMenuId: string | null = null;
  
  // Controle para o Painel Fixo (Desktop)
  activeMenuId: string = 'conta'; // Menu inicial selecionado por padrão
  
  activeSubmenuRoute: string | null = null;

  ngOnInit(): void {
    this.configsService.getMenus().subscribe(data => {
      this.menus = data;
      // Garante que o primeiro menu seja o ativo caso 'conta' não exista
      if (this.menus.length > 0) {
        this.activeMenuId = this.menus[0].id;
      }
    });
  }

  // Ação da Sidebar (Desktop)
  selectMenu(menuId: string): void {
    this.activeMenuId = menuId;
  }

  // Ação do Card (Mobile)
  toggleMenu(menuId: string): void {
    this.expandedMenuId = this.expandedMenuId === menuId ? null : menuId;
  }

  handleSubItemClick(event: Event, subItem: ConfigSubItem): void {
    event.stopPropagation();
    this.activeSubmenuRoute = subItem.route;
    
    // Navega para a sub-rota que renderizará o componente (ex: app-account) dentro do router-outlet
    this.router.navigate(['/configs', ...subItem.route.split('/')]);
  }

  // Retorna o objeto completo do menu ativo para exibir no Desktop
  get activeMenu(): ConfigMenu | undefined {
    return this.menus.find(m => m.id === this.activeMenuId);
  }
}