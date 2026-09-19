import { defineStore } from 'pinia'
import { ref } from 'vue'
import useFetch from '../../composables/useFetch'

type GitHubRepository = {
  stargazers_count: number
}

type GitHubContributor = {
  login: string
  id: number
  avatar_url: string
  html_url: string
  contributions: number
}

export const useMainStore = defineStore('main', () => {
  const isFetching = ref(false)
  const stars = ref(0)
  const contributors = ref<GitHubContributor[]>([])

  function fetchStars() {
    return useFetch<GitHubRepository>({
      url: 'https://api.github.com/repos/graphieros/raindrops-on-roses',
      _then: (data) => {
        stars.value = data.stargazers_count
      },
    })
  }

  const githubClankers = ['dependabot[bot]', 'github-actions[bot]']

  function fetchContributors() {
    return useFetch<GitHubContributor[]>({
      url: 'https://api.github.com/repos/graphieros/raindrops-on-roses/contributors',
      _then: (data) => {
        contributors.value = data.filter(({ login }) => !githubClankers.includes(login))
      },
    })
  }

  return {
    isFetching,
    stars,
    contributors,
    fetchStars,
    fetchContributors,
  }
})
