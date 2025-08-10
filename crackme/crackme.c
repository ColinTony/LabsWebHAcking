
#include <stdio.h>
#include <string.h>

int main(int argc, char** argv){
    if(argc<2){
        printf("Usage: crackme <key>\n");
        return 1;
    }
    int sum=0; for(int i=0;i<strlen(argv[1]);i++) sum += (int)argv[1][i];
    if(strlen(argv[1])==5 && sum==1337){
        printf("OK\n");
        return 0;
    }
    printf("FAIL\n");
    return 1;
}
