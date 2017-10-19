

class JavaClassTemplate {
    constructor(props){
        this.project = props.project || '';
        this.className = props.className || '';
    }
}

const createClassTemplate = (project, className) => {
    return `package ${project}; \r\n \r\n`
    +` public class ${className} {  \r\n\r\n`
    +' public static void main(String[] args){ \r\n '
    +'  for(int i = 0; i < 20; i++) { \r\n'
    +'     System.out.println(\"Testing\: " + i);' 
    +'    \r\n }'
    +'\r\n }'
    +' \r\n\r\n }'
}

const createMetaInfo = (className) => {
    return {
        "main" : className,
        "classes" : []
    }
}

module.exports = {
    createClassTemplate,
    createMetaInfo

}