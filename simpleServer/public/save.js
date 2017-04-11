/**
 * Created by Admin on 28.03.2017.
 */


window.addEventListener('beforeunload', function () {
    localStorage.setItem('content', JSON.stringify(articleServise.articles));
   // localStorage.setItem('user', articleServise.user);
});