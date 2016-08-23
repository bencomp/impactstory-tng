angular.module('currentUser', [
])



    .factory("CurrentUser", function($auth, $http, $q, $route){


        var oauthRedirectUri = {
            orcid: {
                connect: window.location.origin + "/orcid-connect",
                login: window.location.origin + "/orcid-login"
            },
            twitter: {
                register: window.location.origin + "/twitter-register",
                login: window.location.origin + "/twitter-login"
            }
        }

        var sendTokenToIntercom = function(){
            // do send to intercom stuff
        }

        var isAuthenticatedPromise = function(){
            var deferred = $q.defer()
            if ($auth.isAuthenticated()) {
                deferred.resolve()
            }
            else {
                console.log("user isn't logged in, so isAuthenticatedPromise() is rejecting promise.")
                deferred.reject()
            }
            return deferred.promise
        }


        var twitterAuthenticate = function (registerOrLogin) {
            // send the user to twitter.com to authenticate
            // twitter will send them back to us from there.

            console.log("authenticate with twitters!");

            // first ask our server to get the OAuth token that we use to create the
            // twitter URL that we will redirect the user too.
            var redirectUri = oauthRedirectUri.twitter[registerOrLogin]
            var baseUrlToGetOauthTokenFromOurServer = "/api/auth/twitter/request-token?redirectUri=";
            var baseTwitterLoginPageUrl = "https://api.twitter.com/oauth/authenticate?oauth_token="

            $http.get(baseUrlToGetOauthTokenFromOurServer + redirectUri).success(
                function(resp){
                    console.log("twitter request token", resp)
                    var twitterLoginPageUrl = baseTwitterLoginPageUrl + resp.oauth_token
                    window.location = twitterLoginPageUrl
                }
            )

        };

        var orcidAuthenticate = function (showLogin, connectOrLogin) {
            // send the user to orcid.org to authenticate
            // orcid will send them back to us from there.

            console.log("ORCID authenticate!", showLogin)

            var authUrl = "https://orcid.org/oauth/authorize" +
                "?client_id=APP-PF0PDMP7P297AU8S" +
                "&response_type=code" +
                "&scope=/authenticate" +
                "&redirect_uri=" + oauthRedirectUri.orcid[connectOrLogin]

            if (showLogin == "register"){
                // will show the signup screen
            }
            else if (showLogin == "login") {
                // show the login screen (defaults to this)
                authUrl += "&show_login=true"
            }

            window.location = authUrl
            return true
        }

        var callMeEndpoint = function(identityProvider, intent, secretOauthCodes){

            var urlBase = "api/me/"
            var url = urlBase + identityProvider + "/" + intent

            $http.post(url, secretOauthCodes)
                .success(function(resp){
                    console.log("we successfully called the endpoint!", resp)
                    setToken(resp.token)
                })
                .error(function(resp){
                  console.log("problem getting token back from server!", resp)
                    //$location.url("/")
                })
        }


        function setToken(token){
            $auth.setToken(token)
            // make a bunch of decisions here later.

            sendTokenToIntercom()

        }

        return {
            isAuthenticatedPromise: isAuthenticatedPromise,
            twitterAuthenticate: twitterAuthenticate,
            orcidAuthenticate: orcidAuthenticate,
            callMeEndpoint:callMeEndpoint
        }
    })