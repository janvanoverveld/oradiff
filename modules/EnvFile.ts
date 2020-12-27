interface Connect {
    user: string;
    password: string;
    connectString: string;
}

interface Environment {
    name: string;
    description: string;
    alias: string;
    default: boolean;
    connect: Connect;
}

interface EnvFile {
    environments: Environment[];
}

export {EnvFile,Connect}
