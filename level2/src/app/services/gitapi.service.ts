import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GitapiService {
  private headers = new HttpHeaders();
  constructor(private http:HttpClient, ) {
    this.headers.append('Access-Control-Allow-Origin','*');
  }

  search(params:any){
    let url = 'http://localhost:4200/api/';
    url += (params.search ?? 'repositories');
    url += `?q=${params.query.replace(' ','+')}`;
    for(let filter of params.filters){
      url+= `+${filter}`;
    }
    url+=params.page?`&page=${params.page}`:'';
    return this.http.get(url).toPromise()
  }
}
