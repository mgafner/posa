import RSVP from 'rsvp'
import Route from 'ember-route'
import injectService from 'ember-service/inject'

export default Route.extend({
  github: injectService(),

  model() {
    let organization = this.modelFor('organization')

    return organization.get('githubUsers')
      .then(members =>
        RSVP.all(
          members
            .map(member => member.get('login'))
            .map(login =>
              this.get('github').request(`/users/${login}/events/public`, {
                data: { 'per_page': 20 }
              })
            )
        )
        .then(memberFeeds =>
          memberFeeds.reduce((feeds, memberFeed) =>
            feeds.concat(memberFeed)
          , [])
        )
        .then(feed => {
          feed.forEach(event => {
            event.created_at = new Date(event.created_at)
          })
          return feed
        })
        .then(feed =>
          feed.sort((a, b) => b.created_at - a.created_at)
        )
        .then(feed =>
          feed.slice(0, 20)
        )
      )
  }
})
