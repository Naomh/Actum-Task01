function main() {
  var github = new Github();
  var ui = new UI();
  const search = () => {
    const userInput = ui.getInput();
    github.getUser(
      userInput.username,
      userInput.location,
      userInput.language,
      userInput.page,
      userInput.query,
      userInput.search
    );
  };
  document.querySelector("#submit").addEventListener("click", () => {
    ui.page = 1;
    github.pages = 0;
    search();
  });
  document.querySelector("#query").addEventListener("keypress", (event) => {
    ui.page=1;
    github.pages = 0;
    if (event.key === "Enter") search();
  });
  document.querySelector("#pdec").addEventListener("click", () => { if(ui.paginDec()) search();});
  document.querySelector("#pinc").addEventListener("click", () => { if(ui.paginInc(github.pages)) search();});
  document.querySelector("#pset1").addEventListener("click", () => { if(ui.paginSet(1, github.pages)) search();});
  document.querySelector("#psetmax").addEventListener("click", () => { if(ui.paginSet(github.pages, github.pages)) search();});
  document.querySelector("#page").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      if(ui.paginSet(event.path[0].value, github.pages))
      search();
    }
  });
  document.querySelector("#query").addEventListener("keypress", (event) => {
    if (event.key === " " || event.key === "Control") {
      ui.getInput();
    }
  });
}

class UI {
  constructor() {
    this.paginator = document.querySelector("#page");
    this.input = document.querySelector("#query");
    this.user;
    this.location;
    this.userInput;
    this.language;
    this.page = 1;
    this.search;

    this.queryRegexp = new RegExp(
      "user:[a-zA-Z|0-9]+|location:[a-zA-Z|0-9]+|language:[a-zA-Z|0-9]+|search:(users|repositories)",
      "gi"
    );
  }
  
  paginInc(max) {
    if (this.page < max){
      this.page++;
      return true;
    }
    return false;
  }
  paginDec() {
    if (this.page > 1) {
      this.page--;
      return true;
    }
    return false
  }
  paginSet(value, max) {
    if (value >= 1 && value <= max && value !== this.page) {
      this.page = value;
      return true;
    }
    return false;
  }
  getInput() {
   
    this.paginator.disabled = false;
    this.paginator.value = this.page;
    const input = this.input.value.toLowerCase();
    const tags = document.querySelector("#tags");
    let specsIterator = input.matchAll(this.queryRegexp);
    for (let match of specsIterator) {
      const Specifier = match[0].split(":");
      const tag = document.querySelector(`#${Specifier[0]}`);
      this[Specifier[0]] = Specifier[1];
      if (!tag) {
        const element = document.createElement("li");
        element.addEventListener("click", () => this.dispose(Specifier[0]));
        element.id = Specifier[0];
        element.classList.add('tag');
        element.innerHTML = `${Specifier[1]}`;
        tags.appendChild(element);
      } else {
        tag.innerHTML = `${Specifier[1]}`;
      }
    }
    const query = this.input.value = this.input.value.replace(this.queryRegexp, "").trimStart();
    return {
      username: this.user,
      location: this.location,
      language: this.language,
      page: this.page,
      query: query,
      search: this.search,
    };
  }

  dispose(id) {
    this[id] = undefined;
    document.querySelector(`#${id}`).remove();
  }
}
//Github class that will handle the search
class Github {
  constructor() {
    this.data = [];
    this.pages = 0;
  }
  //get the user
  getUser(username, location, language, page, query, search) {
    let url = `https://api.github.com/search/${search ?? "repositories"}?q=`;
    url += query ?? "";
    url += username ? `+user:${username}` : "";
    url += location ? `+location:${location}` : "";
    url += language ? `+language:${language}` : "";
    url += page > 1 ? `&page=${page}` : "";
    fetch(url, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
          return;
        }
        this.data = data.items;
        if (this.pages === 0) {
          this.pages = Math.ceil((data.total_count<1000 ? data.total_count :1000) / data.items.length);
        }
        this.displayData(search ?? "repositories");
      })
      .catch((err) => alert(err));
  }

  //display the user
  displayData(type) {
    const data = this.data;
    const result = document.querySelector("#result");
    result.innerHTML = "";
    data.forEach((element) => {
      const div = document.createElement("div");
      if (type === "users") {
        div.classList.add("card", "col-md-2");
        div.innerHTML = `
                <img src='${element.avatar_url}' alt='${element.login}'>
                <a href='${element.html_url}'><p>${element.login}</p></a>
                <p class='gitid'>${element.id}</p>
            `;
      }
      if (type === "repositories") {
        div.classList.add("repo", "container");
        div.innerHTML = `
                <div class='row'>
                <div class='col-sm-2'>
                <img src='${element.owner.avatar_url}' alt='${
          element.owner.login
        }'>
                </div>
                <div class='col-sm-4'>
                <div class='repository'><a href=${element.html_url}>${
          element.name
        }</div>
                <div class='owner'><a href='${element.owner.html_url}'>${
          element.owner.login
        }</a></div>
                ${
                  element.language
                    ? "<div class='tag'>" + element.language + "</div>"
                    : ""
                }
                </div>
                <div class='col-sm-6 description'><b>Description:</b>
                <p>${element.description ?? ""}</p></div>
                </div>
                
        `;
      }
      result.appendChild(div);
    });
  }
}
