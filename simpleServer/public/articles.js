/**
 * Created by admin on 19.03.2017.
 */



var user = undefined;

var articleServise = (function () {
   // var articles ;

    //localStorage.setItem('content', JSON.stringify(articleServise.articles));
    /*if(localStorage.getItem('content') != null) {
        articles = JSON.parse(localStorage.getItem('content')) || [];
        for (var i = 0; i < articles.length; i++) {
            articles[i].createdAt = new Date(articles[i].createdAt);
        }
    }
    else*/

    let xhr = new XMLHttpRequest();
    xhr.open('GET','/articles',false);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.send();

    const articles = JSON.parse(xhr.responseText, (key,value) => {
        if(key === 'createdAt') return new Date(value)
        return value;
    });

    xhr.open('GET', '/users', false);
    xhr.send();

    const users = JSON.parse(xhr.responseText);

    function xmlRequest(req, url, params) {
        let xhr = new XMLHttpRequest();
        xhr.open(req, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (req === 'DELETE')
            xhr.send();
        else
            xhr.send(JSON.stringify(params));

    }


        function getArticles(skip,top,filterConfig) {
        skip = skip || 0;
        top = top || 10;


        if (filterConfig != undefined) {
            var _author = filterConfig.author;
            var _beginData = filterConfig.beginData;
            var _endData = filterConfig.endData;
        }
        var _article = articles;
        if (_author != undefined) {
            _article = _article.filter(function (param) {
                return param.author.indexOf(_author) > -1;
            });

        }

        if (_endData != undefined && _beginData != undefined) {
            _article = _article.filter(function (param) {
                return param.createdAt >= _beginData && param.createdAt <= _endData;
            });

        }

        if (_endData != undefined && _beginData === undefined) {
            _article = _article.filter(function (param) {
                return param.createdAt <= _endData;
            });
        }

        if (_endData === undefined && _beginData != undefined) {
            _article = _article.filter(function (param) {
                return param.createdAt >= _beginData;
            });
        }


        _article.sort(function (a, b) {
            return a.createdAt - b.createdAt;
        });
        return _article.slice(skip, skip + top);
    }




    function getArticle(id) {
        if(id===undefined) {
            return undefined;
        }
        for(var i = 0; i<articles.length; i++) {
            if(articles[i].id == id) return articles[i];
        }
        return false;
    }

    function validateArticle(article) {
        if (article === undefined ||  typeof article.id !== 'string' || article.id.length <= 0) return false;
        if (typeof article.title !== 'string' || article.title.length <= 0 || article.title.length >= 100) return false;
        if (typeof article.summary !== 'string' || article.summary.length <= 0 || article.summary.summary >= 200) return false;
        if ((article.createdAt instanceof Date) === false) return false;
        if (typeof article.author !== 'string' || article.author.length <= 0) return false;
        if (typeof article.content !== 'string' || article.content <= 0) return false;

        return true;
    }




    function addArticle(article) {
        if(getArticle(article.id) === false) {
            if(validateArticle(article) === true) {
                articles.push(article);
                xmlRequest('POST', '/articles', article);
                return true;
            }
        }
        return false;
    }

    function editArticle(id,article) {
        var articleEdit;
        articleEdit = getArticle(id);
        if(articleEdit===false || articleEdit === undefined) return false;
        if(validateArticle(articleEdit) === true) {
            if(article.title !== undefined) getArticle(id).title = article.title;
            if(article.summary !== undefined) getArticle(id).summary = article.summary;
            if(article.content !== undefined) getArticle(id).content = article.content;
            xmlRequest('PUT', '/articles', articles[i]);
            return true;
        }
        return false;
    }


    function removeArticle(id) {
        for(var i = 0; i<articles.length; i++) {
            if(articles[i].id == id) {
                articles.splice(i,1);
                xmlRequest('DELETE', '/article/'+id+'');
                return true;
            }
        }
        return false;
    }



    return {
        articles:articles,
        users: users,
        getArticles: getArticles,
        getArticle: getArticle,
        addArticle: addArticle,
        editArticle: editArticle,
        removeArticle: removeArticle

    };
}());


var DOMServise = (function () {
    var template;
    var list;
    var authors = [];


    function init() {
        template = document.querySelector('#template-article-list-items');
        list = document.querySelector('.article-list');
    }

    function renderArticle(article) {
        template.content.querySelector('.article-list-items').dataset.id = article.id;
        template.content.querySelector('.article-list-items-title').textContent = article.title;
        template.content.querySelector('.article-list-items-summary').textContent = article.summary;
        template.content.querySelector('.article-list-items-author').textContent = article.author;
        template.content.querySelector('.article-list-items-createdAd').textContent = formatDate(article.createdAt);

        return template.content.querySelector('.article-list-items').cloneNode(true);
    }

    function renderArticles(articles) {
        return articles.map(function (article) {
            return renderArticle(article);
        })
    }

    function formatDate(date) {
        return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' +
            date.getHours() + ':' + date.getMinutes();
    }

    function insertArticlesInDOM(articles) {
        var articlesNodes = renderArticles(articles);
        articlesNodes.forEach(function (node) {
            list.appendChild(node);
        });
        userInterface();
    }

    function removeArticlesFromDOM () {
        list.innerHTML = '';
    }

    function userButtons() {
        userButtonExit = document.getElementById('user-button-exit');
        userButtonSignIn = document.getElementById('user-button-signin');
        userButtonAdd = document.getElementById('user-button-add');
        if(user === undefined) {
            userButtonSignIn.style.display = 'block';
            userButtonAdd.style.display = 'none';
            userButtonExit.style.display = 'none';
            document.getElementById('user-name').textContent = '';
        } else {
            userButtonSignIn.style.display = 'none';
            userButtonAdd.style.display = 'block';
            userButtonExit.style.display = 'block';
            document.getElementById('user-name').textContent = user;
        }
    }

    function userInterface() {
        userButtons();
        if(user === undefined) {
            for(var i = 0;i< document.getElementsByClassName('edit-article').length; i++) {
                document.getElementsByClassName('edit-article')[i].style.display = 'none';
                document.getElementsByClassName('delete-article')[i].style.display = 'none';
            }

        } else {
            for(var i = 0; i<document.getElementsByClassName('edit-article').length; i++) {
                document.getElementsByClassName('edit-article')[i].style.display = 'inline-block';
                document.getElementsByClassName('delete-article')[i].style.display = 'inline-block';
            }
        }
    }

    function deleteArticle(id) {
        if(articleServise.removeArticle(id)) {
            DOMServise.removeArticlesFromDOM();
            insertArticlesInDOM(articleServise.getArticles(0,10));
        }
    }

    function editArticle(id,article) {
        if(articleServise.editArticle(id,article)) {
            DOMServise.removeArticlesFromDOM();
            insertArticlesInDOM(articleServise.getArticles(0, 10));
        }
    }

    function addNews(article) {
        if(articleServise.addArticle(article)) {
            DOMServise.removeArticlesFromDOM();
            insertArticlesInDOM(articleServise.getArticles(0,20));
        }
    }

    function createAuthors() {
        for(var i = 0; i<articleServise.articles.length; i++) {
            if(authors.indexOf(articleServise.articles[i].author)==-1) {
                authors.push(articleServise.articles[i].author);
            }
        }
    }

    createAuthors();

    function domAuthors() {
        var authorsDOM = document.getElementById('Authors');
        for(var i = 0; i<authors.length; i++) {
            var option = document.createElement('option');
            option.className = "options";
            option.innerHTML = authors[i];
            authorsDOM.appendChild(option);
        }
    }

    domAuthors();
    return {
        init: init,
        insertArticlesInDOM: insertArticlesInDOM,
        removeArticlesFromDOM: removeArticlesFromDOM,
        userInterface: userInterface,
        deleteArticle: deleteArticle,
        editArticle: editArticle,
        addNews: addNews,
        userButtons: userButtons,
        formatDate: formatDate
    };
}());


document.addEventListener('DOMContentLoaded', start);

function start() {
    DOMServise.init();
    renderArticles();
    DOMServise.userInterface();
}

function renderArticles(skip, top) {
    DOMServise.removeArticlesFromDOM();
    var articles = articleServise.getArticles(skip, top);
    DOMServise.insertArticlesInDOM(articles);
}

function logIn(userName, password) {

    for(var i = 0; i < articleServise.users.length; i++) {
        if(userName == articleServise.users[i].login && password == articleServise.users[i].password) {
            user = userName;
            DOMServise.userInterface();
            return true;
        }
    }

            user = undefined;
            alert("Неправильно введен логин или пароль");
            return false;



}

function userButtons(userName) {
    user = userName;
    return DOMServise.userButtons();
}




var buttonSignIn = document.getElementById('user-button-signin');
var buttonAddNews = document.getElementById('user-button-add');
var buttonExit = document.getElementById('user-button-exit');
var buttonEnterUser = document.getElementById('user-sign-in');
var logo = document.getElementsByClassName('logo')[0];
var createArticle = document.getElementById('add-edit-news-button');
var listNews = document.querySelector('.article-list');
var buttonFilters = document.getElementById('filter-button');
buttonshowMore = document.getElementById('button-pagination');

var events = (function () {
    var NEWS_ID = null;
    var counter = articleServise.articles.length;
    var per_page = 10;
    function mainPage() {
       document.getElementsByClassName('main-page')[0].style.display = 'block';
       document.getElementsByClassName('signIn-page')[0].style.display = 'none';
       document.getElementsByClassName('add-edit-news-page')[0].style.display = 'none';
       document.getElementsByClassName('fullNews')[0].style.display = 'none';
    }

    function signInPage() {
        document.getElementsByClassName('main-page')[0].style.display = 'none';
        document.getElementsByClassName('signIn-page')[0].style.display = 'block';
        document.getElementsByClassName('add-edit-news-page')[0].style.display = 'none';
        document.getElementsByClassName('fullNews')[0].style.display = 'none';
        document.getElementById('user-signIn-name').value = '';
        document.getElementById('user-signIn-password').value = '';

    }

    function addeditNewsPage() {
        document.getElementsByClassName('main-page')[0].style.display = 'none';
        document.getElementsByClassName('signIn-page')[0].style.display = 'none';
        document.getElementsByClassName('add-edit-news-page')[0].style.display = 'block';
        document.getElementsByClassName('fullNews')[0].style.display = 'none';
    }

    function fullNews() {
        document.getElementsByClassName('main-page')[0].style.display = 'none';
        document.getElementsByClassName('signIn-page')[0].style.display = 'none';
        document.getElementsByClassName('add-edit-news-page')[0].style.display = 'none';
        document.getElementsByClassName('fullNews')[0].style.display = 'block';
    }



    function exit() {
        user = undefined;
        DOMServise.userInterface();
        mainPage();
    }

    function enterUser() {
        var login = document.getElementById('user-signIn-name').value;
        var password = document.getElementById('user-signIn-password').value;
        if(logIn(login,password)) {
            mainPage();
        } else {
            signInPage();
        }

    }

    function delet () {
        if(event.target.className !='delete-article') {
            return;
        }

        var article = event.target.parentElement.parentElement;
        var id = article.dataset.id;
        var articleNodeToDelete = event.target.parentElement.parentElement;
        listNews.removeChild(articleNodeToDelete);
        articleServise.removeArticle(id);
    }

    function delInputValue() {
       document.getElementById('add-edit-news-title').value = "";
        document.getElementById('add-edit-news-summary').value = "";
        document.getElementById('add-edit-news-content').value = "";
    }


    function editArticMenu() {
        if(event.target.className != 'edit-article') {
            return;
        }
        addeditNewsPage();
        var article = event.target.parentElement.parentElement;
        NEWS_ID = article.dataset.id;
        var artic = articleServise.getArticle(NEWS_ID);
        document.getElementById('add-edit-news-title').value = artic.title;
        document.getElementById('add-edit-news-summary').value = artic.summary;
        document.getElementById('add-edit-news-content').value = artic.content;

    }

   function AddAndEditNews() {

       var title = document.getElementById('add-edit-news-title').value;
       var summary = document.getElementById('add-edit-news-summary').value;
       var content = document.getElementById('add-edit-news-content').value;
       if(articleServise.getArticle(NEWS_ID) == false) {
           var author = user;
           var id = title+"/"+summary+"/"+author;
           DOMServise.addNews({id: id, title: title, summary: summary, createdAt: new Date(), author: user, content: content});
       } else {
           DOMServise.editArticle(NEWS_ID,{title: title,summary: summary,content: content});
           NEWS_ID = null;
       }

       delInputValue();
       mainPage();
   }

    function showArticle() {
        if(event.target.className != 'show-article') {
            return;
        }
        var article = event.target.parentElement.parentElement;
        var id = article.dataset.id;
        var buf = articleServise.getArticle(id);
        document.getElementsByClassName('title')[0].textContent = buf.title;
        document.getElementsByClassName('content')[0].textContent = buf.content;
        document.getElementsByClassName('author-date')[0].textContent = buf.author + DOMServise.formatDate(buf.createdAt);
        fullNews();
    }

    function filters() {
        var authors = document.getElementById("Authors");
        var begin_date = "0001-01-01";
        var end_date = "3000-01-01";

        if(authors.value != "Все") {
          var  authorSelected = authors.value;
        }
        if( document.getElementById("begin-date").value !== "") {
            begin_date = document.getElementById("begin-date").value;
        }
        if(document.getElementById("end-date").value !== "") {
             end_date = document.getElementById("end-date").value;
        }

        var articles = articleServise.getArticles(0,20,{beginData: new Date(begin_date),endData: new Date(end_date),author: authorSelected});
        counter = articles.length;
        DOMServise.removeArticlesFromDOM();
        DOMServise.insertArticlesInDOM(articles);

    }

    function showMoreNews() {
        if(per_page>counter) {
            document.getElementById('button-pagination').style.display = 'none';
        } else {
            renderArticles(per_page,10);
            per_page+=10;
        }
    }

    return {
        mainPage : mainPage,
        signInPage : signInPage,
        addeditNewsPage : addeditNewsPage,
        exit: exit,
        enterUser : enterUser,
        delet : delet,
        showArticle: showArticle,
        editArticMenu : editArticMenu,
        AddAndEditNews : AddAndEditNews,
        filters : filters,
        showMoreNews : showMoreNews
    };

}());

buttonSignIn.addEventListener('click',events.signInPage);
buttonAddNews.addEventListener('click',events.addeditNewsPage);
buttonExit.addEventListener('click',events.exit);
buttonEnterUser.addEventListener('click',events.enterUser);
logo.addEventListener('click',events.mainPage);
listNews.addEventListener('click', events.delet);
listNews.addEventListener('click',events.showArticle);
createArticle.addEventListener('click',events.AddAndEditNews);
listNews.addEventListener('click',events.editArticMenu);
buttonFilters.addEventListener('click',events.filters);
buttonshowMore.addEventListener('click',events.showMoreNews);




