
// Simple vulnerable TCP service on 31337. Compile with no protections.
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

void win() {
    system("cat /app/flag.txt");
    fflush(stdout);
}

void handle(int sock) {
    char buf[128];
    write(sock, "Welcome to bover. Send your payload:\n", 37);
    ssize_t n = read(sock, buf, 1024); // overflow on purpose
    if(n > 0) {
        write(sock, "Thanks. Bye.\n", 13);
    }
    close(sock);
}

int main() {
    int s = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(s, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    struct sockaddr_in addr; addr.sin_family = AF_INET; addr.sin_port = htons(31337); addr.sin_addr.s_addr = INADDR_ANY;
    bind(s, (struct sockaddr*)&addr, sizeof(addr));
    listen(s, 5);
    while(1){
        int c = accept(s, NULL, NULL);
        if(c>=0) handle(c);
    }
    return 0;
}
