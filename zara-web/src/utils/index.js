export function makeDisplayName(profile) {
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  } else if (profile.first_name) {
    return profile.first_name;
  } else if (profile.last_name) {
    return profile.last_name;
  } else {
    return "Unknown Name";
  }
}

export function isJson(myVar) {
  if (typeof myVar === "object" && myVar !== null) {
    return true;
  } else {
    return false;
  }
}