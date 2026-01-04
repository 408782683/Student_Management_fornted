const defaultHeaders = {
  Accept: 'application/json, */*',
};

function buildUrl(baseUrl, path, query) {
  const url = new URL(path, baseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }
  return url.toString();
}

export async function apiRequest(baseUrl, path, { method = 'GET', query, body, isFormData = false } = {}) {
  const url = buildUrl(baseUrl, path, query);
  const headers = { ...defaultHeaders };
  const options = { method, headers };

  if (body !== undefined && body !== null) {
    if (isFormData) {
      delete options.headers['Content-Type'];
      options.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    const errorText = contentType.includes('application/json') ? JSON.stringify(await response.json()) : await response.text();
    throw new Error(`请求失败: ${response.status} ${errorText}`);
  }

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export async function apiRequestBlob(baseUrl, path, { query } = {}) {
  const url = buildUrl(baseUrl, path, query);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }
  return response.blob();
}
