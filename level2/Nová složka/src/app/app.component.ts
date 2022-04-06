import { Component } from '@angular/core';
import { GitapiService } from './services/gitapi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  public loading = false;
  public data:any;
  public title = 'level2';
  public ui = new UI();
  public searchParams:{'query': string, 'filters':Set<string>, 'search':string, 'page':number }=<any>{search:'repositories'};
  constructor(private gitApi:GitapiService){}

  public getQuery(input:any){
   this.searchParams = this.ui.getInput(input);
  }
  public pageEvent(foo:'setPage'|'nextPage'|'prevPage', val?:number|string){
    if(foo === 'setPage' && !val || foo !=='setPage' && val){
      return;
    }
    this.ui[foo](<number>val);
    this.update()
  }
  public submit(searchbar:HTMLInputElement){
    this.ui.setPage(1);
    this.ui.setMaxPage(0);
    this.getQuery(searchbar);
    this.search()
  }
  public search(){
  this.loading = true;
  this.data=[];
  this.gitApi.search(this.searchParams).then((res:any) => {
  if(this.ui.getMaxPage() === 0){
    const maxPage = Math.ceil((res.total_count<=1000 ? res.total_count:1000)/30);
    this.ui.setMaxPage(maxPage);
  }
  this.data = res.items;
  }).catch((err:any) => {
    console.log(err);
  }).finally(() => this.loading=false );
  }
  public update(){
    this.searchParams.page = this.ui.getCurPage();
    this.search();
  }
}
export class UI{
  private autoFilter:any=[];
  private maxPage = 0;
  private queryRegexp = new RegExp("user:[a-zA-Z|0-9]+|location:[a-zA-Z|0-9]+|language:[a-zA-Z|0-9]+","gi");
  private searchRegexp = new RegExp("search:(users|repositories)","i");
  private replaceRegexp = new RegExp(this.queryRegexp.source+'|'+this.searchRegexp.source,'gi');
  private lastWordRegexp = new RegExp('(\\S)+$', 'gm');
  private currentPage = 1;
  private filters:Set<string> = new Set();
  private searchtype:'repositories'|'users' = 'repositories';
  constructor(){}
  public autocomplete_correct(input:HTMLInputElement, key:string){
    if(key==='ArrowUp'){
      return;
    }
    if(this.autoFilter.length === 0){
      return;
    }
    const match = input.value.match(this.lastWordRegexp);
    if(!match){
      return;
    }
    const lastWord = match[0];
    this.autoFilter = this.autoFilter.filter((filter:string) => {
      return filter.match(lastWord+'$');
    })
    console.log(this.autoFilter);
  }
  public autocomplete(input:HTMLInputElement){
    if(this.autoFilter.length>1){
    let i=0;
    if(input.value.match(this.autoFilter[0])){
      i=1;
    }
     input.value = input.value.replace(this.lastWordRegexp,this.autoFilter[i]);
     return;
    }
    if(this.autoFilter.length==1){
      input.value = input.value.replace(this.lastWordRegexp,this.autoFilter[0]);
      return;
    }
    this.autocomplete_sugest(input);
  }

  private autocomplete_sugest(input:HTMLInputElement){
  const match = input.value.match(this.lastWordRegexp);
  if(!match || !match[0]){
    return;
  }
  const lastWord = match[0];
  let autoFilters:string[] = [] ;
  switch(lastWord[0]){
    case 'u':
      autoFilters.push('user:');
      break;
    case 'l':
      autoFilters.push('location:');
      autoFilters.push('language:');
      break;
    case 's':
      autoFilters.push('search:');
      break;

    default:
      return;
  }

    autoFilters = autoFilters.filter(filter => {
      console.log(filter);
      return filter.match(lastWord);
    });
    if(autoFilters.length>0){
    this.autoFilter = autoFilters;
    console.log(this.autoFilter);
     input.value = input.value.replace(this.lastWordRegexp,this.autoFilter[0]);
    }


  }
  public setMaxPage(val:number){
    this.maxPage = val;
  }
  public getMaxPage(){
    return this.maxPage;
  }
  public removeTag(event:any){
    if(event.target.textContent === ('users'||'repositories')){
      this.searchtype=this.searchtype === 'users'? 'repositories':'users'}else
   {event.target.remove();
    this.filters.delete(event.target.textContent);}
  }
  public setMax(value:number){
    this.maxPage = value;
    this.currentPage = 1;
  }
  public getCurPage(){
    return this.currentPage;
  }
  public nextPage():boolean{
    if(this.currentPage < this.maxPage){
      this.currentPage++;
      return true;
    }
    return false;
  }
  public prevPage():boolean{
    if(this.currentPage > 1){
      this.currentPage--;
      return true;
    }
    return false;
  }
  public setPage(value:any):boolean{
    if(value >= 1 && value <= this.maxPage && value !== this.currentPage){
      this.currentPage = value;
      return true;
    }
    return false;
  }

 public getInput(input:HTMLInputElement){
  const userInput: string = input.value;
  let search: any = userInput.match(this.searchRegexp);
  if(search){
    this.searchtype = <'users'|'repositories'>Array.from(search)[1];
  }
  const matchces: IterableIterator<RegExpMatchArray> = userInput.matchAll(this.queryRegexp);
  for (let match of matchces){
    this.filters.add(match[0].toLowerCase());
  }
const query = input.value = input.value.replace(this.replaceRegexp,'').trimStart();
return {'query': query, 'filters':this.filters, 'search':this.searchtype, 'page':this.currentPage }
}
}
