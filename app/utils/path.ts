
export const isPathAccessible = (
    currentPath: string,
    roles: string[],
    basePaths: string[]
  ): boolean => {
    return basePaths.some(basePath =>
      roles.some(role => currentPath.startsWith(`${basePath}/${role}`))
    );
  };
  
// const roles = ['user', 'business']; // Valid roles
// const basePaths = ['/dashboard', '/profile']; // Base paths that require role access

