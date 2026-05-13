import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Members } from './members';
import { AuthService } from '../../core/services/auth.service';
import { UserResponseDTO } from '../../core/services/models/auth.models';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Members', () => {
  let component: Members;
  let fixture: ComponentFixture<Members>;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  const mockMembers: UserResponseDTO[] = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com',
      role: 'MONITOR',
      familyId: 1,
      familyName: 'Família Silva'
    },
    {
      id: 2,
      name: 'Maria Silva',
      email: 'maria@example.com',
      role: 'MINOR',
      familyId: 1,
      familyName: 'Família Silva'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Members, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(Members);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch family members from /api/families/family/{familyId}', () => {
    const familyId = '1';
    component.familyId = familyId;

    vi.spyOn(authService, 'getFamilyMembers').mockReturnValue(of(mockMembers));

    component.fetchFamilyMembers(familyId);

    expect(component.members).toEqual(mockMembers);
    expect(component.loading).toBeFalsy();
    expect(component.error).toBeNull();
  });

  it('should handle error when fetching family members', () => {
    const familyId = '1';
    const error = new Error('Network error');

    vi.spyOn(authService, 'getFamilyMembers').mockReturnValue(
      new Promise((_, reject) => reject(error)) as any
    );

    vi.spyOn(console, 'error');

    component.familyId = familyId;
    component.fetchFamilyMembers(familyId);

    expect(component.loading).toBeFalsy();
  });

  it('should create a family with POST /api/families', () => {
    const familyName = 'Nova Família';
    const newFamilyResponse = { id: 2, familyName };

    vi.spyOn(authService, 'getToken').mockReturnValue('mock-token');
    vi.spyOn(component['router'], 'navigate');

    (component as any).createFamily(familyName);

    const req = httpMock.expectOne('http://localhost:8082/api/families');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.familyName).toEqual(familyName);

    req.flush(newFamilyResponse);

    expect(component.loading).toBeFalsy();
    expect(component['router'].navigate).toHaveBeenCalledWith(
      ['/members'],
      { queryParams: { family: newFamilyResponse.id } }
    );
  });

  it('should include authorization header when creating family', () => {
    const token = 'mock-bearer-token';
    const familyName = 'Família com Token';

    vi.spyOn(authService, 'getToken').mockReturnValue(token);
    vi.spyOn(component['router'], 'navigate');

    (component as any).createFamily(familyName);

    const req = httpMock.expectOne('http://localhost:8082/api/families');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    req.flush({ id: 2, familyName });
  });

  it('should handle error when creating family', () => {
    const familyName = 'Família Erro';
    const errorMessage = 'Server error';

    vi.spyOn(authService, 'getToken').mockReturnValue('mock-token');
    vi.spyOn(console, 'error');

    (component as any).createFamily(familyName);

    const req = httpMock.expectOne('http://localhost:8082/api/families');
    req.error(new ErrorEvent(errorMessage));

    expect(component.error).toBe('Erro ao criar família');
    expect(component.loading).toBeFalsy();
  });

  it('should validate empty family name before creating', () => {
    (component as any).createFamily('   ');

    expect(component.error).toBe('Nome da família é obrigatório');
    httpMock.expectNone('http://localhost:8082/api/families');
  });

  it('should have correct endpoint URL for fetching members', () => {
    const familyId = '5';
    const expectedUrl = `http://localhost:8082/api/families/family/${familyId}`;

    vi.spyOn(authService, 'getFamilyMembers').mockReturnValue(of(mockMembers));
    component.fetchFamilyMembers(familyId);

    expect(authService.getFamilyMembers).toHaveBeenCalledWith(familyId);
  });

  it('should initialize members as empty array', () => {
    expect(component.members).toEqual([]);
  });

  it('should set loading to true when fetching members', () => {
    const familyId = '1';
    vi.spyOn(authService, 'getFamilyMembers').mockReturnValue(of(mockMembers));

    expect(component.loading).toBeFalsy();
    component.fetchFamilyMembers(familyId);
    expect(component.loading).toBeFalsy(); // After async operation completes
  });
});
