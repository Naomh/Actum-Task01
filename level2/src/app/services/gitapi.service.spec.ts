import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GitapiService } from './gitapi.service';

describe('GitapiService', () => {
  let service: GitapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[HttpClient],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(GitapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
