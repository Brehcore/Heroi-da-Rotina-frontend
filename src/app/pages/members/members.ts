import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MemberDTO } from '../../core/services/models/auth.models';
import { AuthService } from '../../core/services/auth.service';

export interface CreateFamilyDTO {
  familyName: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: 'MONITOR' | 'MINOR';
  familyId: number;
}

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './members.html',
  styleUrls: ['./members.scss']
})
export class Members implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  private readonly API_BASE = 'http://localhost:8082';

  members: MemberDTO[] = [];
  loading = false;
  error: string | null = null;
  familyId: string | null = null;
  showProfileMenu = false;
  familyNameInput = '';
  showCreateFamilyForm = false;
  showCreateUserForm = false;
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'MINOR' as 'MONITOR' | 'MINOR'
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.familyId = this.route.snapshot.queryParamMap.get('family') || null;

    if (!this.familyId) {
      this.familyId = sessionStorage.getItem('selectedFamilyId') || localStorage.getItem('selectedFamilyId');
    }

    if (this.familyId) {
      this.fetchFamilyMembers(this.familyId);
    }
  }

  fetchFamilyMembers(familyId: string): void {
    this.loading = true;
    this.error = null;

    this.authService.getFamilyMembers(familyId).subscribe({
      next: (members) => {
        this.members = members || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar membros da família:', err);
        this.error = 'Erro ao carregar membros da família';
        this.loading = false;
      }
    });
  }

  createFamily(familyName: string): void {
    if (!familyName.trim()) {
      this.error = 'Nome da família é obrigatório';
      return;
    }

    const token = this.authService.getToken();
    const httpHeaders = token 
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;
    const createFamilyDTO: CreateFamilyDTO = { familyName };

    this.loading = true;
    this.error = null;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.post<{ id: number; familyName: string }>(
      `${this.API_BASE}/api/families`,
      createFamilyDTO,
      options
    ).subscribe({
      next: (response) => {
        console.log('Família criada com sucesso:', response);
        this.loading = false;
        this.router.navigate(['/members'], { queryParams: { family: response.id } });
      },
      error: (err) => {
        console.error('Erro ao criar família:', err);
        this.error = 'Erro ao criar família';
        this.loading = false;
      }
    });
  }

  onCreateFamily(): void {
    this.createFamily(this.familyNameInput);
    this.familyNameInput = '';
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  openProfile(): void {
    this.showProfileMenu = false;
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.showProfileMenu = false;
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  goToMinor(member: MemberDTO): void {
    this.router.navigate(['/minor'], {
      queryParams: {
        minorId: member.id,
        minorName: member.name
      }
    });
  }

  toggleCreateFamilyForm(): void {
    this.showCreateFamilyForm = !this.showCreateFamilyForm;
  }

  closeCreateFamilyForm(): void {
    this.showCreateFamilyForm = false;
    this.familyNameInput = '';
  }

  toggleCreateUserForm(): void {
    this.showCreateUserForm = !this.showCreateUserForm;
  }

  closeCreateUserForm(): void {
    this.showCreateUserForm = false;
    this.newUser = {
      name: '',
      email: '',
      password: '',
      role: 'MINOR'
    };
  }

  createUser(): void {
    if (!this.newUser.name.trim() || !this.newUser.email.trim() || !this.newUser.password.trim()) {
      this.error = 'Todos os campos são obrigatórios';
      return;
    }

    if (!this.familyId) {
      this.error = 'ID da família não encontrado';
      return;
    }

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const createUserDTO: CreateUserDTO = {
      name: this.newUser.name,
      email: this.newUser.email,
      password: this.newUser.password,
      role: this.newUser.role,
      familyId: parseInt(this.familyId, 10)
    };

    this.loading = true;
    this.error = null;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.post<MemberDTO>(
      `${this.API_BASE}/api/users`,
      createUserDTO,
      options
    ).subscribe({
      next: (response) => {
        console.log('Usuário criado com sucesso:', response);
        this.loading = false;
        this.members.push(response);
        this.closeCreateUserForm();
      },
      error: (err) => {
        console.error('Erro ao criar usuário:', err);
        this.error = 'Erro ao criar usuário';
        this.loading = false;
      }
    });
  }
}
