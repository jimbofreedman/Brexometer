import merge from 'deepmerge';

class DynamicConfigService {
  constructor() {
    this.config = {
      redirects: [],
      survey_end: {
        messenger_prompt: true,
        compare_users: [],
      },
    };
  }

  setConfigFromRaw(rawConfig) {
    try {
      this.config = merge(
        this.config,
        JSON.parse(
          decodeURIComponent(decodeURIComponent(decodeURIComponent(rawConfig)))
        )
      );
      console.log(this.config);
    } catch (e) {}
    if (this.config) {
      return true;
    }
    return false;
  }

  getConfig() {}

  getNextRedirect() {
    if (this.config.redirects.length === 0) {
      return null;
    }
    if (this.config.redirects[0] === '/') {
      return `/${this.getNextRedirectConfig()}`;
    }
    if (this.config.redirects[0].slice(-1) === '/') {
      return this.config.redirects[0] + this.getNextRedirectConfig();
    }
    return `${this.config.redirects[0]}/${this.getNextRedirectConfig()}`;
  }

  getNextRedirectConfig() {
    if (this.config.redirects.length === 0) {
      return encodeURIComponent(JSON.stringify(this.config));
    }
    const config_clone = JSON.parse(JSON.stringify(this.config));
    config_clone.redirects.shift();
    return encodeURIComponent(JSON.stringify(config_clone));
  }

  encodeConfig() {
    return encodeURIComponent(JSON.stringify(this.config));
  }

  getNextConfigWithRedirect(url) {
    const parts = url.split('/');
    console.log(parts);
    const last_part = parts[parts.length - 1];
    const first_two_chars = last_part.substring(0, 2);
    let updated_url = '';

    if (first_two_chars === '%7' || first_two_chars === '{"') {
      updated_url = '/';
      parts.shift();
      parts.map((part, index) => {
        if (index !== parts.length - 1) {
          console.log('PART', part);
          updated_url = `${updated_url + part}/`;
        }
      });
    } else {
      updated_url = url;
    }

    console.log(updated_url);

    this.config.redirects[0] = updated_url;
    return this.encodeConfig();
  }
}

export default new DynamicConfigService();
