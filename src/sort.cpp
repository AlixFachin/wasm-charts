#include <stdio.h>
#include <vector>
#include <algorithm>
using namespace std;

extern "C"
{

    void addOne(int *input_ptr, int *output_ptr, int len)
    {
        int i;
        for (i = 0; i < len; i++)
        {
            output_ptr[i] = input_ptr[i] + 1;
        }
    }

    void cppsort(int *number_array, int len)
    {
        vector<int> v;
        for (int i = 0; i < len; i++)
        {
            v.push_back(number_array[i]);
            // printf("Pushing %d\n", number_array[i]);
        }
        sort(v.begin(), v.end());
        for (int i = 0; i < len; i++)
        {
            // printf("Copying %d\n", v[i]);
            number_array[i] = v[i];
        }
    }
}

int main()
{
    printf("Bonjour le monde!\n");
    return 0;
}
