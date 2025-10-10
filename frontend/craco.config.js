const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Override webpack dev server configuration to fix deprecation warnings
      return webpackConfig;
    },
  },
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    // Override webpack dev server configuration to use new setupMiddlewares
    if (devServerConfig.onBeforeSetupMiddleware || devServerConfig.onAfterSetupMiddleware) {
      const beforeSetup = devServerConfig.onBeforeSetupMiddleware;
      const afterSetup = devServerConfig.onAfterSetupMiddleware;
      
      delete devServerConfig.onBeforeSetupMiddleware;
      delete devServerConfig.onAfterSetupMiddleware;
      
      // Use new setupMiddlewares approach
      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        if (beforeSetup && typeof beforeSetup === 'function') {
          beforeSetup(devServer);
        }
        
        if (afterSetup && typeof afterSetup === 'function') {
          afterSetup(devServer);
        }
        
        return middlewares;
      };
    }
    
    // Improve stability
    devServerConfig.client = {
      ...devServerConfig.client,
      webSocketURL: 'auto://0.0.0.0:0/ws',
      logging: 'error',
      overlay: {
        errors: true,
        warnings: false,
      },
    };
    
    // Reduce memory usage and improve performance
    devServerConfig.watchFiles = {
      paths: ['src/**/*'],
      options: {
        usePolling: false,
        interval: 1000,
        binaryInterval: 1000,
        ignoreInitial: true,
        persistent: true,
      },
    };
    
    return devServerConfig;
  },
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig, cracoConfig, pluginOptions, context: { env, paths } }) => {
          // Optimize for development stability
          if (env === 'development') {
            webpackConfig.optimization = {
              ...webpackConfig.optimization,
              removeAvailableModules: false,
              removeEmptyChunks: false,
              splitChunks: false,
            };
            
            // Reduce rebuild time
            webpackConfig.cache = {
              type: 'filesystem',
              buildDependencies: {
                config: [__filename],
              },
            };
          }
          
          return webpackConfig;
        },
      },
    },
  ],
};