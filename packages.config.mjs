export default {
  scope: "@raindrops-on-roses",

  modulesDirectory: "modules",
  packagesDirectory: "packages",

  initialVersion: "0.0.0",

  umbrella: {
    name: "raindrops-on-roses",
    readme: "README.md",
  },

  naming: {
    separator: "-",
  },

  publish: {
    access: "public",

    trustedPublisher: {
      provider: "github",
      repository: "graphieros/raindrops-on-roses",
      workflow: "publish.yml",
      environment: "npm",
    },
  },
};
