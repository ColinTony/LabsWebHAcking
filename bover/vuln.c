
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
    setvbuf(stdout, NULL, _IONBF, 0);
    unsigned int unlock = 0xDEADBEEF;
    char buf[64];
    puts("Welcome to BOver (buffer overflow).");
    puts("Send your payload:");
    gets(buf); // vulnerable
    if (unlock == 0x41414141) {
        printf("flag{c0l1nr00t_bof}\n");
    } else {
        printf("Nope. unlock=0x%08X\n", unlock);
    }
    return 0;
}
