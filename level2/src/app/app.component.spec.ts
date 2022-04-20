import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { GitapiService } from './services/gitapi.service';
import { HttpClient } from '@angular/common/http';
 import { fakeAsync, tick } from '@angular/core/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [GitapiService, HttpClient],
      imports: [HttpClientTestingModule],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'level2'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('level2');
  });

  it('should parse the search query',  () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const input = <HTMLInputElement>{};
    input.value = 'pepe';
    let expected = {'query': 'pepe', 'filters':new Set() as Set<string>, 'search': 'repositories', 'page': 1};
    app.getQuery(input);
    expect(app.searchParams).toEqual(expected);

    input.value = '';
    expected = {'query': '', 'filters':new Set() as Set<string>, 'search': 'repositories', 'page': 1};
    app.getQuery(input);
    expect(app.searchParams).toEqual(expected);

    input.value = 'pepe,pepe search:users search:repositories user:pepe user:pepe user:depe location:pepe language:pepe';
    expected = {'query': 'pepe,pepe', 'filters':new Set(['user:pepe', 'user:depe', 'location:pepe', 'language:pepe']) as Set<string>, 'search': 'repositories', 'page': 1};
    app.getQuery(input);
    expect(app.searchParams).toEqual(expected);
  });
 it('should autocomplete the search query',  () => {
  const fixture = TestBed.createComponent(AppComponent);
  const app = fixture.componentInstance;
  const input = <HTMLInputElement>{};
  input.value = 'u';
  app.ui.autocomplete(input);
  expect(input.value).toEqual('user:');
  input.value = 'l';
  app.ui.autocomplete_correct(input, 'l');
  app.ui.autocomplete(input);
  expect(input.value).toEqual('location:');
  app.ui.autocomplete(input);
  expect(input.value).toEqual('language:');
  app.ui.autocomplete(input);
  expect(input.value).toEqual('location:');
  input.value = 's';
  app.ui.autocomplete_correct(input, 's');
  app.ui.autocomplete(input);
  expect(input.value).toEqual('search:');
  input.value = 'su';
  app.ui.autocomplete_correct(input, 'su');
  app.ui.autocomplete(input);
  expect(input.value).toEqual('su');
  input.value = 'user:N';
  app.ui.autocomplete_correct(input, 'N');
  app.ui.autocomplete(input);
  expect(input.value).toEqual('user:N');
});

});
