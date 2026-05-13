import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserResponseDTO } from '../../core/services/models/auth.models';
import { AuthService } from '../../core/services/auth.service';
import { AvatarSelectorComponent, AvatarSelectionData } from '../../components/avatar-selector/avatar-selector';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AvatarSelectorComponent, Navbar],
  templateUrl: './members.html',
  styleUrls: ['./members.scss']
})
export class Members implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  private readonly API_BASE = 'http://localhost:8082';
  private readonly DICEBEAR_BASE = 'https://api.dicebear.com/8.x/avataaars/svg';

  members: UserResponseDTO[] = [];
  loading = false;
  error: string | null = null;
  familyId: string | null = null;
  showCreateUserForm = false;
  useAvatarSelector = true;
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'MINOR' as 'MONITOR' | 'MINOR',
    profilePictureUrl: ''
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
        console.log('Membros carregados do DB:', members);
        console.log('Avatars do DB:', members?.map(m => ({ name: m.name, profilePictureUrl: m.profilePictureUrl })));
        this.members = (members || []).map(member => ({
          ...member,
          profilePictureUrl: member.profilePictureUrl || this.generateMemberAvatar(member.name)
        }));
        console.log('Membros após processamento:', this.members);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar membros da família:', err);
        this.error = 'Erro ao carregar membros da família';
        this.loading = false;
      }
    });
  }

  private generateMemberAvatar(memberName: string): string {
    const seed = encodeURIComponent(memberName || 'member');
    return `${this.DICEBEAR_BASE}?seed=${seed}`;
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
      role: 'MINOR',
      profilePictureUrl: undefined
    } as any;
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

    const createUserDTO = {
      name: this.newUser.name,
      email: this.newUser.email,
      password: this.newUser.password,
      role: this.newUser.role,
      familyId: parseInt(this.familyId, 10),
      profilePictureUrl: this.newUser.profilePictureUrl
    };

    this.loading = true;
    this.error = null;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.post<UserResponseDTO>(
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

  onAvatarSelected(data: AvatarSelectionData): void {
    if (!this.familyId) {
      this.error = 'ID da família não encontrado';
      return;
    }

    const token = this.authService.getToken();
    const httpHeaders = token
      ? new HttpHeaders({ 'Authorization': `Bearer ${token}` })
      : undefined;

    const createUserDTO = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      familyId: parseInt(this.familyId, 10),
      profilePictureUrl: data.profilePictureUrl
    };

    this.loading = true;
    this.error = null;

    const options = httpHeaders ? { headers: httpHeaders } : {};

    this.http.post<UserResponseDTO>(
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
